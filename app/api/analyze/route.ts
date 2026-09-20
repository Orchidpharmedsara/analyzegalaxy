/**
 * POST /api/analyze
 * Main analysis pipeline. Accepts multipart/form-data with either:
 *   - file: video file upload
 *   - url: Instagram URL
 *
 * Streams progress via SSE (Server-Sent Events).
 */
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { downloadFromUrl, saveUploadedFile } from '@/lib/downloader';
import { extractMetadata, generateThumbnail, extractAudio, compressVideoForAI } from '@/lib/videoProcessor';
import { analyzeVideo, transcribeAudio } from '@/lib/analyzer';
import { prisma } from '@/lib/db';
import type { ProgressEvent, AnalysisStatus } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes


function createSSEStream() {
  let controller: ReadableStreamDefaultController<Uint8Array>;
  const encoder = new TextEncoder();
  let keepAliveInterval: NodeJS.Timeout;

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
      // Send a ping every 15 seconds to prevent browser/proxy timeouts
      keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch (err) {
          clearInterval(keepAliveInterval);
        }
      }, 15000);
    },
    cancel() {
      clearInterval(keepAliveInterval);
    }
  });

  function send(event: ProgressEvent) {
    const data = `data: ${JSON.stringify(event)}\n\n`;
    try {
      controller.enqueue(encoder.encode(data));
    } catch (err) {
      clearInterval(keepAliveInterval);
    }
  }

  function close() {
    clearInterval(keepAliveInterval);
    try {
      controller.close();
    } catch (err) {
      // already closed
    }
  }

  return { stream, send, close };
}

export async function POST(request: NextRequest) {
  const { stream, send, close } = createSSEStream();

  // Run pipeline async — SSE response is returned immediately
  (async () => {
    const videoId = uuidv4();
    let filePath: string | null = null;
    let sourceType: 'upload' | 'instagram' = 'upload';
    let originalUrl: string | undefined;
    let caption: string | undefined;
    let hashtags: string | undefined;
    let extractedMetadata: Partial<import('@/lib/types').VideoMetadata> = {};

    try {
      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('multipart/form-data')) {
        // File upload
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const url = formData.get('url') as string | null;

        if (url && url.trim()) {
          // Instagram URL via form
          sourceType = 'instagram';
          originalUrl = url.trim();

          send({ status: 'downloading', message: 'Downloading video from Instagram...' });
          const result = await downloadFromUrl(originalUrl, videoId);
          filePath = result.filePath;
          caption = result.caption;
          hashtags = result.hashtags;
          if (result.metadata) extractedMetadata = result.metadata;
        } else if (file) {
          // File upload
          sourceType = 'upload';
          send({ status: 'processing', message: 'Saving uploaded video...' });

          const buffer = Buffer.from(await file.arrayBuffer());
          filePath = await saveUploadedFile(buffer, file.name, videoId);
        } else {
          send({ status: 'error', message: 'No file or URL provided.', error: 'Please provide a video file or Instagram URL.' });
          close();
          return;
        }
      } else {
        // JSON body with URL
        const body = await request.json();
        if (body.url) {
          sourceType = 'instagram';
          originalUrl = body.url.trim();

          send({ status: 'downloading', message: 'Downloading video from Instagram...' });
          const result = await downloadFromUrl(originalUrl as string, videoId);
          filePath = result.filePath;
          caption = result.caption;
          hashtags = result.hashtags;
          if (result.metadata) extractedMetadata = result.metadata;
        } else {
          send({ status: 'error', message: 'No URL provided.', error: 'Please provide an Instagram URL.' });
          close();
          return;
        }
      }

      if (!filePath || !fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
        send({ status: 'error', message: 'Video file not found after download.', error: 'Download failed.' });
        close();
        return;
      }

      // Step 2: Extract metadata + thumbnail
      send({ status: 'processing', message: 'Extracting video metadata...' });
      const outputDir = path.dirname(filePath);

      const [metadata, thumbnailPath] = await Promise.all([
        extractMetadata(filePath),
        generateThumbnail(filePath, outputDir).catch(() => null),
      ]);

      // Step 3: Extract + transcribe audio
      send({ status: 'transcribing', message: 'Transcribing audio...' });
      let transcript = '';
      try {
        const audioPath = await extractAudio(filePath, outputDir);
        transcript = await transcribeAudio(audioPath);
      } catch (err) {
        console.warn('[api/analyze] Audio transcription failed:', err);
      }

      // Step 3.5: Compress video for AI upload ONLY if > 20MB
      let finalVideoPath = filePath;
      const MAX_UNCOMPRESSED_SIZE = 20 * 1024 * 1024; // 20 MB
      
      if (metadata.fileSize && metadata.fileSize > MAX_UNCOMPRESSED_SIZE) {
        send({ status: 'processing', message: 'Video is large. Compressing for AI upload...' });
        try {
          finalVideoPath = await compressVideoForAI(filePath, outputDir);
        } catch (err) {
          console.warn('[api/analyze] Compression failed, falling back to original:', err);
        }
      } else {
        console.log(`[api/analyze] Skipping compression. File size is ${(metadata.fileSize! / 1024 / 1024).toFixed(2)}MB`);
      }

      // Step 4: Analyze video with Gemini
      send({ status: 'analyzing', message: 'Analyzing with Gemini AI (this takes 10–20 seconds)...' });
      const analysisResult = await analyzeVideo(finalVideoPath, {
        caption,
        hashtags,
        transcript,
        metadata: extractedMetadata,
        onProgress: (text) => {
          send({ status: 'generating', message: 'Writing analysis...', rawText: text });
        }
      });

      // Step 5: Save to database
      send({ status: 'saving', message: 'Saving results...' });

      // Make paths relative to public/ for serving
      const relativeFilePath = filePath.replace(
        path.join(process.cwd(), 'public'),
        ''
      );
      const relativeThumbnailPath = thumbnailPath
        ? thumbnailPath.replace(path.join(process.cwd(), 'public'), '')
        : null;

      const video = await prisma.video.create({
        data: {
          id: videoId,
          sourceType,
          originalUrl,
          filePath: relativeFilePath,
          thumbnailPath: relativeThumbnailPath,
          caption,
          hashtags,
          transcript,
          duration: metadata.duration,
          resolution: metadata.resolution,
          fps: metadata.fps,
          aspectRatio: metadata.aspectRatio,
          fileSize: metadata.fileSize,
          likeCount: extractedMetadata.likeCount,
          commentCount: extractedMetadata.commentCount,
          viewCount: extractedMetadata.viewCount,
          authorUsername: extractedMetadata.authorUsername,
        },
      });

      const analysis = await prisma.analysis.create({
        data: {
          videoId: video.id,
          performancePotential: analysisResult.performancePotential,
          growthPotential: analysisResult.growthPotential,
          experimentValue: analysisResult.experimentValue,
          evidenceConfidence: analysisResult.evidenceConfidence,

          scores: JSON.stringify(analysisResult.scores || {}),
          evidence: JSON.stringify(analysisResult.evidence || {}),
          timeline: JSON.stringify(analysisResult.timeline || []),
          strengths: JSON.stringify(analysisResult.strengths || []),
          weaknesses: JSON.stringify(analysisResult.weaknesses || []),
          riskPoints: JSON.stringify(analysisResult.riskPoints || []),
          experiments: JSON.stringify(analysisResult.experiments || []),

          // Legacy fields
          overallScore: analysisResult.overallScore,
          overallScoreExplanation: analysisResult.overallScoreExplanation,
          videoSummary: analysisResult.videoSummary,
          whatWorked: analysisResult.whatWorked,
          whyItCouldWorkOnSocial: analysisResult.whyItCouldWorkOnSocial,
          narrativeCritique: analysisResult.narrativeCritique,
          improvementSuggestions: JSON.stringify(analysisResult.improvementSuggestions || []),
        },
      });

      send({
        status: 'done',
        message: 'Analysis complete!',
        analysisId: analysis.id,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[api/analyze] Pipeline error:', err);
      send({
        status: 'error',
        message: 'Analysis failed.',
        error: message,
      });
    } finally {
      close();
    }
  })();

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
