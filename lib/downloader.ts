/**
 * Isolated Instagram/URL download module using yt-dlp.
 * All Instagram-specific logic is contained here — easy to patch
 * when Instagram changes their site structure.
 */
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import type { DownloadResult } from './types';

const execFileAsync = promisify(execFile);

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Find yt-dlp binary (pip-installed or system)
 */
function getYtDlpBinary(): string {
  // Common pip install locations on Mac and Linux
  const candidates = [
    path.join(process.cwd(), 'yt-dlp'), // Downloaded locally during build phase
    '/usr/local/bin/yt-dlp',
    '/usr/bin/yt-dlp',
    '/opt/homebrew/bin/yt-dlp',
    `${process.env.HOME}/.local/bin/yt-dlp`,
    `${process.env.HOME}/Library/Python/3.12/bin/yt-dlp`,
    `${process.env.HOME}/Library/Python/3.11/bin/yt-dlp`,
    `${process.env.HOME}/Library/Python/3.10/bin/yt-dlp`,
    'yt-dlp', // system PATH fallback
  ];

  for (const candidate of candidates) {
    try {
      if (candidate !== 'yt-dlp' && fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
        return candidate;
      }
    } catch {
      // continue
    }
  }
  return 'yt-dlp';
}

/**
 * Validate that a URL looks like a supported social media URL.
 * Currently supports: Instagram Reels/posts
 */
export function validateUrl(url: string): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '');

    if (!['instagram.com'].includes(host)) {
      return {
        valid: false,
        reason: `Unsupported platform: ${host}. Only Instagram links are supported.`,
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Invalid URL format.' };
  }
}

/**
 * Download video from a social media URL using yt-dlp.
 * Returns file path + any available metadata.
 */
export async function downloadFromUrl(
  url: string,
  videoId: string
): Promise<DownloadResult> {
  const validation = validateUrl(url);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const outputDir = path.join(UPLOADS_DIR, videoId);
  ensureDir(outputDir);

  const outputTemplate = path.join(outputDir, 'video.%(ext)s');
  const ytDlp = getYtDlpBinary();

  // Step 1: Get metadata (JSON) without downloading
  let caption: string | undefined;
  let hashtags: string | undefined;
  let extractedMeta: Partial<import('./types').VideoMetadata> = {};

  try {
    const { stdout: metaJson } = await execFileAsync(
      ytDlp,
      [
        '--dump-json',
        '--no-playlist',
        '--quiet',
        '--no-check-certificate',
        url,
      ],
      { timeout: 30000 }
    );

    const meta = JSON.parse(metaJson.trim());
    const description: string = meta.description || meta.title || '';

    // Extract hashtags from description
    const hashtagMatches = description.match(/#[\w\u00C0-\u017F]+/g) || [];
    hashtags = hashtagMatches.join(' ');

    // Caption is the description minus hashtags
    caption = description
      .replace(/#[\w\u00C0-\u017F]+/g, '')
      .trim()
      .slice(0, 2000); // sensible cap

    extractedMeta = {
      likeCount: typeof meta.like_count === 'number' ? meta.like_count : undefined,
      commentCount: typeof meta.comment_count === 'number' ? meta.comment_count : undefined,
      viewCount: typeof meta.view_count === 'number' ? meta.view_count : undefined,
      authorUsername: meta.uploader || meta.channel || meta.uploader_id,
    };
  } catch {
    // Metadata extraction is best-effort; continue with download
    console.warn('[downloader] Could not extract metadata from URL');
  }

  // Step 2: Download the video
  try {
    await execFileAsync(
      ytDlp,
      [
        '--no-playlist',
        '--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        '--merge-output-format', 'mp4',
        '--output', outputTemplate,
        '--quiet',
        '--no-warnings',
        '--no-check-certificate',
        url,
      ],
      { timeout: 120000 } // 2 min timeout
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    if (errorMessage.includes('Private video') || errorMessage.includes('private')) {
      throw new Error('This video is private or unavailable. Only public videos can be analyzed.');
    }
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      throw new Error('Video not found. The URL may be invalid or the post may have been deleted.');
    }
    if (errorMessage.includes('ENOENT')) {
      throw new Error('yt-dlp is not installed. Run: pip3 install yt-dlp');
    }

    throw new Error(`Download failed: ${errorMessage}`);
  }

  // Find the downloaded file
  const files = fs.readdirSync(outputDir);
  const videoFile = files.find((f) =>
    ['.mp4', '.mov', '.webm', '.mkv'].some((ext) => f.endsWith(ext))
  );

  if (!videoFile) {
    throw new Error('Download completed but no video file was found. The format may be unsupported.');
  }

  const filePath = path.join(outputDir, videoFile);

  return {
    filePath,
    caption: caption || undefined,
    hashtags: hashtags || undefined,
    metadata: extractedMeta,
  };
}

/**
 * Save an uploaded video file to the uploads directory.
 * Returns the saved file path.
 */
export async function saveUploadedFile(
  buffer: Buffer,
  originalFilename: string,
  videoId: string
): Promise<string> {
  const ext = path.extname(originalFilename).toLowerCase();
  const allowedExts = ['.mp4', '.mov', '.webm', '.mkv', '.avi'];

  if (!allowedExts.includes(ext)) {
    throw new Error(
      `Unsupported file format: ${ext}. Supported formats: MP4, MOV, WebM, MKV, AVI.`
    );
  }

  const outputDir = path.join(UPLOADS_DIR, videoId);
  ensureDir(outputDir);

  const filePath = path.join(outputDir, `video${ext}`);
  fs.writeFileSync(filePath, buffer);

  return filePath;
}
