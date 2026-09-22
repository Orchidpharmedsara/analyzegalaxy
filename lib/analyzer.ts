/**
 * Core analysis engine using Gemini's multimodal API.
 * Uploads video, transcribes audio, and produces structured critique.
 */
import { GoogleGenAI, createPartFromUri } from '@google/genai';
import fs from 'fs';
import path from 'path';
import type { AnalysisResult, CategoryScore, DropoffPoint, HealthClaim, PolicyFlag, PredictedMetricValue, Prescription } from './types';
import { prisma } from './db';
import { STAGE_0_PROMPT, STAGE_1_PROMPT, NODE_A_OBSERVER_PROMPT, NODE_B_SKEPTIC_PROMPT, NODE_C_COACH_PROMPT } from './prompts';

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

  if (options.onProgress) {
    options.onProgress('استخراج ساختار ویدیو (مرحله ۱ از ۲)...');
  }
  
  // STAGE 0: Structure Extraction
  console.log('[analyzer] Running Stage 0 (Structure Extraction)...');
  const stage0Response = await generateWithFallback(client, {
    contents: [
      {
        role: 'user',
        parts: [
          createPartFromUri(videoUri, mimeType),
          { text: STAGE_0_PROMPT },
        ],
      },
    ],
    config: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    }
  });
  
  const stage0Raw = stage0Response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  let stage0Clean = stage0Raw.trim();
  if (stage0Clean.startsWith('```')) {
    stage0Clean = stage0Clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  let stage0Json;
  try {
    stage0Json = JSON.parse(stage0Clean);
  } catch (err) {
    console.warn('[analyzer] Failed to parse Stage 0 JSON. Proceeding with raw text.');
    stage0Json = { raw_output: stage0Clean };
  }

  // STAGE 1: Anchored Scoring
  if (options.onProgress) {
    options.onProgress('تحلیل و امتیازدهی (مرحله ۲ از ۲)...');
  }

  // Build the prompt with Stage 0 output and context
  let fullPrompt = STAGE_1_PROMPT;
  fullPrompt += `\n\n=== STAGE 0 STRUCTURE ===\n${JSON.stringify(stage0Json, null, 2)}\n\n`;
  fullPrompt += `=== OBJECTIVE ===\nreach\n\n`;
  fullPrompt += `=== PILLAR ===\nother\n\n`;

  let contextSection = '';
  if (options.caption || options.hashtags || options.transcript) {
    contextSection = '\n\n=== ADDITIONAL CONTEXT ===\n';
    if (options.caption) contextSection += `Caption: ${options.caption}\n`;
    if (options.hashtags) contextSection += `Hashtags: ${options.hashtags}\n`;
    if (options.transcript && !options.transcript.includes('[No speech detected]')) {
      contextSection += `Transcript/Voiceover: ${options.transcript}\n`;
    }
    if (options.metadata) {
      const { likeCount, commentCount, viewCount, authorUsername } = options.metadata;
      contextSection += `\nEngagement Metrics:\n`;
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

  fullPrompt += contextSection;

  console.log('[analyzer] Sending video to Gemini for Stage 1 analysis...');

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

  let parsed: any;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(
      `Failed to parse analysis response. Raw response:\n${rawText.slice(0, 500)}`
    );
  }

  // Map to the new AnalysisResult interface
  const overall = parsed.overall || {};

  return {
    performancePotential: overall.performance_potential || null,
    growthPotential: overall.growth_potential || null,
    experimentValue: overall.experiment_value || null,
    evidenceConfidence: overall.evidence_confidence || null,
    
    scores: parsed.scores || {},
    evidence: parsed.evidence || { observed: [], calculated: [], predicted: [], inferred: [], unknown: [] },
    timeline: parsed.timeline || [],
    strengths: parsed.strengths || [],
    weaknesses: parsed.weaknesses || [],
    riskPoints: parsed.risk_points || [],
    experiments: parsed.experiments || [],

    // Legacy fields for backward compatibility
    overallScore: overall.performance_potential || 0,
    overallScoreExplanation: '',
    videoSummary: stage0Json?.structure ? JSON.stringify(stage0Json.structure.shots) : '',
    whatWorked: '',
    whyItCouldWorkOnSocial: '',
    narrativeCritique: '',
    improvementSuggestions: [],
  };
}

/**
 * 3-Step AI Chain Analysis
 * Bypasses heavy video upload by using an image grid and transcript.
 */
export async function analyzeVideo3StepChain(
  imageGridPath: string,
  options: {
    transcript: string;
    baseline: any; // InstagramBaseline
    onProgress?: (text: string) => void;
  }
) {
  const client = getClient();
  const imageData = fs.readFileSync(imageGridPath).toString('base64');
  
  if (options.onProgress) options.onProgress('استخراج داده‌های عینی (مرحله ۱ از ۳)...');
  
  // NODE A: The Observer
  console.log('[analyzer] Running Node A (Observer)...');
  const nodeAResponse = await generateWithFallback(client, {
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageData } },
          { text: `Transcript:\n${options.transcript}\n\n${NODE_A_OBSERVER_PROMPT}` }
        ]
      }
    ],
    config: { temperature: 0.2, responseMimeType: 'application/json' }
  });
  
  const cleanJson = (text: string) => {
    let clean = text.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    return clean;
  };

  const nodeAText = nodeAResponse.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const nodeAJson = JSON.parse(cleanJson(nodeAText));

  if (options.onProgress) options.onProgress('نقد الگوریتم (مرحله ۲ از ۳)...');
  
  // NODE B: The Skeptic
  console.log('[analyzer] Running Node B (Skeptic)...');
  const nodeBPrompt = `${NODE_B_SKEPTIC_PROMPT}\n\n=== OBJECTIVE DATA ===\n${JSON.stringify(nodeAJson, null, 2)}\n\n=== ACCOUNT BASELINE ===\n${JSON.stringify(options.baseline, null, 2)}`;
  const nodeBResponse = await generateWithFallback(client, {
    contents: [{ role: 'user', parts: [{ text: nodeBPrompt }] }],
    config: { temperature: 0.5, responseMimeType: 'application/json' }
  });
  
  const nodeBText = nodeBResponse.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const nodeBJson = JSON.parse(cleanJson(nodeBText));

  if (options.onProgress) options.onProgress('تدوین گزارش مربی (مرحله ۳ از ۳)...');
  
  // NODE C: The Coach
  console.log('[analyzer] Running Node C (Coach)...');
  const nodeCPrompt = `${NODE_C_COACH_PROMPT}\n\n=== ALGORITHM CRITIQUE ===\n${JSON.stringify(nodeBJson, null, 2)}`;
  const nodeCResponse = await generateWithFallback(client, {
    contents: [{ role: 'user', parts: [{ text: nodeCPrompt }] }],
    config: { temperature: 0.7, responseMimeType: 'application/json' }
  });
  
  const nodeCText = nodeCResponse.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const nodeCJson = JSON.parse(cleanJson(nodeCText));

  return {
    nodeA: nodeAJson,
    nodeB: nodeBJson,
    nodeC: nodeCJson,
  };
}
