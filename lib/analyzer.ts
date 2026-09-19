/**
 * Core analysis engine using Gemini's multimodal API.
 * Uploads video, transcribes audio, and produces structured critique.
 */
import { GoogleGenAI, createPartFromUri } from '@google/genai';
import fs from 'fs';
import path from 'path';
import type { AnalysisResult, CategoryScore } from './types';
import { prisma } from './db';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Candidate models in order of preference and availability
const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-latest',
];

function getClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to your .env.local file.'
    );
  }
  return new GoogleGenAI({ apiKey: key });
}

const ANALYSIS_PROMPT = `You are a sharp, honest social media strategist with deep expertise in short-form video performance on Instagram Reels.

You will be given a video to analyze. Your job is to produce a detailed, honest critique explaining what makes this video work — or not work — on social media. Be specific and opinionated. If the video is mediocre or wouldn't perform well, say so clearly and explain why. Avoid generic praise.

IMPORTANT LANGUAGE RULE: You MUST write the ENTIRE JSON response (including all reasons, paragraphs, and suggestions) in Persian (Farsi).

Analyze the video against these 10 categories and score each 1–10:

1. **Hook (first 1–3 seconds)**: Does it stop the scroll? Is there a clear pattern interrupt, question, or visual surprise immediately?
2. **Pacing & editing**: Cut frequency, rhythm, whether it drags or moves too fast, use of jump cuts/text pop-ons.
3. **Audio & sound design**: Use of trending audio, voiceover clarity, music/sound effect timing, silence used intentionally or awkwardly.
4. **Visual quality & style**: Framing, lighting, composition, whether the visual style fits the platform's native feel vs. looking like an ad.
5. **Caption / on-screen text**: Effectiveness of overlaid text and the written caption — clarity, curiosity gap, hook reinforcement.
6. **Storytelling / structure**: Is there a clear arc (setup → tension/curiosity → payoff)? Does it earn a rewatch?
7. **Relatability / shareability**: Would someone tag a friend, save it, or feel "this is so me"? Emotional or practical value.
8. **Trend & format alignment**: Does it ride a current format, sound, or meme structure — and does it do so in a fresh way, or does it feel derivative?
9. **Watch-through potential**: Likelihood someone watches to the end given length, pacing, and payoff placement.
10. **Page Overall View & Engagement**: Evaluate the overall performance EXCLUSIVELY using the provided engagement metrics (Likes, Comments, Views) and Author/Username. Do not guess or make up data. How did the audience actually react based on the raw numbers? Is the engagement rate healthy for a page of this size/type? IMPORTANT: If NO engagement metrics are provided, predict the score based purely on the objective quality and explain in the reason that it is a prediction.

IMPORTANT SCORING RULE: The \`overall_score\` MUST logically reflect the data and USE THE FULL 0-100 SPECTRUM. Do NOT cluster scores around 85-88. Be extremely harsh. If a video is mediocre, give it a 40. If it is terrible, give it a 15. If engagement metrics are provided and they are huge, the score MUST be high (e.g. >85). Do not give a low score to a viral video.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation outside JSON). ALL VALUES MUST BE IN PERSIAN (FARSI):

{
  "overall_score": <integer 0-100, heavily influenced by real engagement data, use the full spectrum (e.g. 20, 50, 95) based on actual quality and data>,
  "overall_score_explanation": "<3-4 sentences in Persian explaining exactly why you chose this specific number, referencing the data and your harsh evaluation criteria>",
  "category_scores": [
    {
      "category": "<category name in Persian>",
      "score": <integer 1-10>,
      "reason": "<1-2 sentences in Persian, specific and honest>"
    }
  ],
  "video_summary": "<A complete, scene-by-scene breakdown in Persian. You MUST write out the exact script/dialogue that was spoken in the video, paired directly with a detailed description of what happens visually in each scene. Demonstrate complete understanding of the video.>",
  "what_worked": "<2-3 sentences in Persian on the video's strongest elements. Be specific — cite actual moments or techniques.>",
  "why_it_could_work_on_social": "<2-3 sentences in Persian connecting the video's mechanics and engagement metrics to actual platform behavior. If it WOULDN'T work, explain why clearly.>",
  "narrative_critique": "<3-5 honest paragraphs in Persian. Analyze what actually worked and what didn't. Call out real weaknesses. Don't be flattering. Be the advisor who tells the truth.>",
  "improvement_suggestions": [
    "<Specific, actionable suggestion 1 in Persian>",
    "<Specific, actionable suggestion 2 in Persian>",
    "<Specific, actionable suggestion 3 in Persian>",
    "<Specific, actionable suggestion 4 in Persian>",
    "<Specific, actionable suggestion 5 in Persian>"
  ]
}`;

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypeMap: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
    '.mkv': 'video/x-matroska',
    '.avi': 'video/x-msvideo',
  };
  return mimeTypeMap[ext] || 'video/mp4';
}

/**
 * Helper to generate content with retries and fallback across candidate models
 */
async function generateWithFallback(
  client: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
) {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[analyzer] Trying model ${model} (attempt ${attempt})...`);
        const response = await client.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        console.warn(`[analyzer] Attempt ${attempt} on ${model} failed:`, msg);

        // If 503 / UNAVAILABLE or 429 / RESOURCE_EXHAUSTED, wait and retry
        const isTransient = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('429') || msg.includes('high demand');
        if (isTransient && attempt < 3) {
          const delay = attempt * 2000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        // Break to try next candidate model
        break;
      }
    }
  }

  throw lastError || new Error('Failed to generate content with available models');
}

/**
 * Upload video to Gemini Files API and wait for it to be processed.
 */
async function uploadVideoToGemini(
  client: GoogleGenAI,
  filePath: string
): Promise<{ uri: string; mimeType: string }> {
  const mimeType = getMimeType(filePath);
  const fileSize = fs.statSync(filePath).size;

  console.log(`[analyzer] Uploading video to Gemini Files API (${Math.round(fileSize / 1024 / 1024)}MB)...`);

  let uploadedFile;
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      uploadedFile = await client.files.upload({
        file: new Blob([fs.readFileSync(filePath)], { type: mimeType }),
        config: { mimeType, displayName: path.basename(filePath) },
      });
      break;
    } catch (err: any) {
      lastError = err;
      console.warn(`[analyzer] Upload attempt ${attempt} failed: ${err.message || String(err)}`);
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 3000 * attempt));
      }
    }
  }

  if (!uploadedFile || !uploadedFile.uri) {
    throw lastError || new Error('File upload failed: no URI returned');
  }

  // Wait for the file to be processed (ACTIVE state)
  let fileStatus = uploadedFile;
  let attempts = 0;
  while (fileStatus.state === 'PROCESSING' && attempts < 30) {
    await new Promise((r) => setTimeout(r, 2000));
    fileStatus = await client.files.get({ name: uploadedFile.name! });
    attempts++;
  }

  if (fileStatus.state === 'FAILED') {
    throw new Error('Gemini file processing failed. The video format may not be supported.');
  }

  console.log(`[analyzer] Video uploaded and ready: ${uploadedFile.uri}`);
  return { uri: uploadedFile.uri, mimeType };
}

/**
 * Transcribe audio using Gemini's audio understanding.
 * Returns transcript text or empty string if no speech detected.
 */
export async function transcribeAudio(audioPath: string): Promise<string> {
  const client = getClient();

  if (!fs.existsSync(audioPath)) {
    return '';
  }

  try {
    const audioData = fs.readFileSync(audioPath);
    const base64Audio = audioData.toString('base64');

    const response = await generateWithFallback(client, {
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'audio/mpeg',
                data: base64Audio,
              },
            },
            {
              text: 'Transcribe all spoken words and voiceover in this audio. Include everything said. If there is no speech, just return: [No speech detected]',
            },
          ],
        },
      ],
    });

    const transcript = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return transcript.trim();
  } catch (err) {
    console.warn('[analyzer] Audio transcription failed:', err);
    return '';
  }
}

/**
 * Main analysis function. Uploads video to Gemini and runs the full rubric evaluation.
 */
export async function analyzeVideo(
  videoPath: string,
  options: {
    caption?: string;
    hashtags?: string;
    transcript?: string;
    metadata?: Partial<import('./types').VideoMetadata>;
    onProgress?: (text: string) => void;
  } = {}
): Promise<AnalysisResult> {
  const client = getClient();

  // Upload video to Gemini Files API
  const { uri: videoUri, mimeType } = await uploadVideoToGemini(client, videoPath);

  // Build the prompt with optional context
  let contextSection = '';
  if (options.caption || options.hashtags || options.transcript) {
    contextSection = '\n\nAdditional context about this video:\n';
    if (options.caption) {
      contextSection += `Caption: ${options.caption}\n`;
    }
    if (options.hashtags) {
      contextSection += `Hashtags: ${options.hashtags}\n`;
    }
    if (options.transcript && !options.transcript.includes('[No speech detected]')) {
      contextSection += `Transcript/Voiceover: ${options.transcript}\n`;
    }
    if (options.metadata) {
      const { likeCount, commentCount, viewCount, authorUsername } = options.metadata;
      contextSection += `\nEngagement Metrics (evaluate these heavily for overall page success):\n`;
      if (authorUsername) contextSection += `- Author/Username: ${authorUsername}\n`;
      if (viewCount !== undefined) contextSection += `- Views: ${viewCount}\n`;
      if (likeCount !== undefined) contextSection += `- Likes: ${likeCount}\n`;
      if (commentCount !== undefined) contextSection += `- Comments: ${commentCount}\n`;
    }
  }

  // Inject RAG Training Data (Past User Feedback)
  try {
    const pastFeedback = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    if (pastFeedback.length > 0) {
      contextSection += `\n\n=== CRITICAL TRAINING DATA (USER FEEDBACK) ===\n`;
      contextSection += `The user has corrected your past analyses. You MUST adhere to the following feedback when scoring this new video:\n`;
      pastFeedback.forEach((fb, idx) => {
        if (fb.correction) {
          contextSection += `Feedback ${idx + 1}: "${fb.correction}"\n`;
        }
      });
      contextSection += `==============================================\n`;
    }
  } catch (err) {
    console.warn('[analyzer] Failed to fetch training feedback:', err);
  }

  const fullPrompt = ANALYSIS_PROMPT + contextSection;

  console.log('[analyzer] Sending video to Gemini for analysis...');

  const responseStream = await client.models.generateContentStream({
    model: CANDIDATE_MODELS[0], // fallback logic omitted for stream simplicity
    contents: [
      {
        role: 'user',
        parts: [
          createPartFromUri(videoUri, mimeType),
          { text: fullPrompt },
        ],
      },
    ],
    config: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  let rawText = '';
  for await (const chunk of responseStream) {
    if (chunk.text) {
      rawText += chunk.text;
      if (options.onProgress) {
        options.onProgress(rawText);
      }
    }
  }

  // Parse JSON response — strip any markdown fences if present
  let jsonText = rawText.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  let parsed: {
    overall_score: number;
    overall_score_explanation: string;
    category_scores: Array<{ category: string; score: number; reason: string }>;
    video_summary: string;
    what_worked: string;
    why_it_could_work_on_social: string;
    narrative_critique: string;
    improvement_suggestions: string[];
  };

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(
      `Failed to parse analysis response. Raw response:\n${rawText.slice(0, 500)}`
    );
  }

  // Validate and normalize
  const categoryScores: CategoryScore[] = (parsed.category_scores || []).map(
    (cs) => ({
      category: String(cs.category || ''),
      score: Math.min(10, Math.max(1, Math.round(Number(cs.score) || 5))),
      reason: String(cs.reason || ''),
    })
  );

  const overallScore = Math.min(
    100,
    Math.max(0, Math.round(Number(parsed.overall_score) || 0))
  );

  return {
    overallScore,
    overallScoreExplanation: String(parsed.overall_score_explanation || ''),
    categoryScores,
    videoSummary: String(parsed.video_summary || ''),
    whatWorked: String(parsed.what_worked || ''),
    whyItCouldWorkOnSocial: String(parsed.why_it_could_work_on_social || ''),
    narrativeCritique: String(parsed.narrative_critique || ''),
    improvementSuggestions: Array.isArray(parsed.improvement_suggestions)
      ? parsed.improvement_suggestions.map(String)
      : [],
  };
}
