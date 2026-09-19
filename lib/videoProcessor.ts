/**
 * Video processing module using fluent-ffmpeg.
 * Extracts technical metadata, generates thumbnails, and extracts audio.
 */
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
// @ts-ignore — ffprobe-static has no types
import ffprobePath from 'ffprobe-static';
import path from 'path';
import fs from 'fs';
import type { VideoMetadata } from './types';

import { execSync } from 'child_process';

// Use the bundled ffmpeg binary from ffmpeg-static, fall back to system ffmpeg
function resolveFFmpegPath(): string {
  // If the npm-bundled binary exists and is executable, use it
  if (ffmpegPath && require('fs').existsSync(ffmpegPath)) {
    try {
      execSync(`"${ffmpegPath}" -version`, { stdio: 'ignore' });
      return ffmpegPath;
    } catch {}
  }
  // Fall back to system ffmpeg (installed via nixpacks on Railway)
  return 'ffmpeg';
}

function resolveFFprobePath(): string {
  const bundled = ffprobePath?.path;
  if (bundled && require('fs').existsSync(bundled)) {
    try {
      execSync(`"${bundled}" -version`, { stdio: 'ignore' });
      return bundled;
    } catch {}
  }
  return 'ffprobe';
}

ffmpeg.setFfmpegPath(resolveFFmpegPath());
ffmpeg.setFfprobePath(resolveFFprobePath());


/**
 * Extract technical metadata from a video file.
 */
export async function extractMetadata(filePath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) {
        reject(new Error(`Failed to read video metadata: ${err.message}`));
        return;
      }

      const videoStream = data.streams.find((s) => s.codec_type === 'video');

      if (!videoStream) {
        reject(new Error('No video stream found in the file.'));
        return;
      }

      const width = videoStream.width || 0;
      const height = videoStream.height || 0;
      const duration = data.format.duration || 0;
      const fileSize = data.format.size || 0;

      // Calculate FPS from r_frame_rate (e.g. "30/1" or "30000/1001")
      let fps = 0;
      if (videoStream.r_frame_rate) {
        const parts = videoStream.r_frame_rate.split('/');
        if (parts.length === 2) {
          fps = Math.round((parseInt(parts[0]) / parseInt(parts[1])) * 100) / 100;
        }
      }

      // Calculate aspect ratio
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(width, height);
      const aspectRatio =
        divisor > 0 ? `${width / divisor}:${height / divisor}` : `${width}:${height}`;

      resolve({
        duration: Math.round(duration * 100) / 100,
        resolution: `${width}x${height}`,
        fps,
        aspectRatio,
        fileSize,
      });
    });
  });
}

/**
 * Generate a thumbnail image from a video file at the 1-second mark.
 * Returns the thumbnail file path.
 */
export async function generateThumbnail(
  filePath: string,
  outputDir: string
): Promise<string> {
  const thumbnailPath = path.join(outputDir, 'thumbnail.jpg');

  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .screenshots({
        timestamps: ['00:00:01'],
        filename: 'thumbnail.jpg',
        folder: outputDir,
        size: '640x?',
      })
      .on('end', () => resolve(thumbnailPath))
      .on('error', (err) => {
        // If 1s mark fails (very short video), try 0s
        ffmpeg(filePath)
          .screenshots({
            timestamps: ['00:00:00'],
            filename: 'thumbnail.jpg',
            folder: outputDir,
            size: '640x?',
          })
          .on('end', () => resolve(thumbnailPath))
          .on('error', (err2) =>
            reject(new Error(`Thumbnail generation failed: ${err2.message}`))
          );
      });
  });
}

/**
 * Extract audio from a video file as MP3.
 * Returns the audio file path.
 */
export async function extractAudio(
  filePath: string,
  outputDir: string
): Promise<string> {
  const audioPath = path.join(outputDir, 'audio.mp3');

  // Skip if already extracted
  if (fs.existsSync(audioPath)) {
    return audioPath;
  }

  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate(128)
      .output(audioPath)
      .on('end', () => resolve(audioPath))
      .on('error', (err, stdout, stderr) =>
        reject(new Error(`Audio extraction failed: ${err.message}\nStderr: ${stderr}`))
      )
      .run();
  });
}

/**
 * Compress video specifically for AI analysis to speed up upload.
 * Scales down to 480p, reduces framerate to 15fps, and lowers bitrate.
 */
export async function compressVideoForAI(
  filePath: string,
  outputDir: string
): Promise<string> {
  const compressedPath = path.join(outputDir, 'video_compressed.mp4');

  if (fs.existsSync(compressedPath)) {
    return compressedPath;
  }

  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .outputOptions([
        '-vf', 'scale=-2:480',
        '-r', '15',
        '-c:v', 'libx264',
        '-crf', '28',
        '-preset', 'fast',
        '-c:a', 'aac',
        '-b:a', '64k',
      ])
      .output(compressedPath)
      .on('end', () => resolve(compressedPath))
      .on('error', (err, stdout, stderr) =>
        reject(new Error(`Video compression failed: ${err.message}\nStderr: ${stderr}`))
      )
      .run();
  });
}
