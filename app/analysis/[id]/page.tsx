import { notFound } from 'next/navigation';
import Link from 'next/link';
import ScoreGauge from '@/components/ScoreGauge';
import CategoryScores from '@/components/CategoryScores';
import VideoPlayer from '@/components/VideoPlayer';
import FeedbackForm from '@/components/FeedbackForm';
import type { AnalysisRecord } from '@/lib/types';

import { prisma } from '@/lib/db';

async function getAnalysis(id: string): Promise<AnalysisRecord | null> {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: { video: true },
    });

    if (!analysis) return null;

    return {
      id: analysis.id,
      videoId: analysis.videoId,
      overallScore: analysis.overallScore,
      overallScoreExplanation: analysis.overallScoreExplanation,
      categoryScores: JSON.parse(analysis.categoryScores),
      videoSummary: analysis.videoSummary,
      whatWorked: analysis.whatWorked,
      whyItCouldWorkOnSocial: analysis.whyItCouldWorkOnSocial,
      narrativeCritique: analysis.narrativeCritique,
      improvementSuggestions: JSON.parse(analysis.improvementSuggestions),
      createdAt: analysis.createdAt.toISOString(),
      video: {
        id: analysis.video.id,
        sourceType: analysis.video.sourceType as 'instagram' | 'upload',
        originalUrl: analysis.video.originalUrl,
        filePath: analysis.video.filePath,
        thumbnailPath: analysis.video.thumbnailPath,
        caption: analysis.video.caption,
        hashtags: analysis.video.hashtags,
        transcript: analysis.video.transcript,
        duration: analysis.video.duration,
        resolution: analysis.video.resolution,
        fps: analysis.video.fps,
        aspectRatio: analysis.video.aspectRatio,
        fileSize: analysis.video.fileSize,
        likeCount: analysis.video.likeCount,
        commentCount: analysis.video.commentCount,
        viewCount: analysis.video.viewCount,
        authorUsername: analysis.video.authorUsername,
        createdAt: analysis.video.createdAt.toISOString(),
      },
    };
  } catch (err) {
    console.error('Failed to get analysis from db:', err);
    return null;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const analysis = await getAnalysis(id);

  if (!analysis) notFound();

  const { video } = analysis;

  return (
    <div className="space-y-8">
      {/* Back */}
      <div className="flex items-center gap-4">
        <Link
          href="/history"
          className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
        >
          ← History
        </Link>
        <span className="text-gray-700">·</span>
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
        >
          + New Analysis
        </Link>
      </div>

      {/* Header: video + overall score */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Video player */}
        <div>
          <VideoPlayer
            videoId={video.id}
            thumbnailPath={video.thumbnailPath}
            duration={video.duration}
          />

          {/* Video metadata */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
            {video.duration && (
              <span>⏱ {formatDuration(video.duration)}</span>
            )}
            {video.resolution && <span>📐 {video.resolution}</span>}
            {video.fps && <span>🎥 {video.fps}fps</span>}
            {video.aspectRatio && <span>↔ {video.aspectRatio}</span>}
            <span>
              {video.sourceType === 'instagram' ? '📸 Instagram' : '📁 Uploaded'}
            </span>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-blue-400 font-medium">
            {video.authorUsername && <span>👤 @{video.authorUsername}</span>}
            {video.viewCount != null && <span>👁 {video.viewCount.toLocaleString()} views</span>}
            {video.likeCount != null && <span>❤️ {video.likeCount.toLocaleString()} likes</span>}
            {video.commentCount != null && <span>💬 {video.commentCount.toLocaleString()} comments</span>}
          </div>

          {video.caption && (
            <div className="mt-3 text-sm text-gray-400 leading-relaxed">
              <span className="font-medium text-gray-300">Caption: </span>
              {video.caption.length > 200
                ? video.caption.slice(0, 200) + '…'
                : video.caption}
            </div>
          )}

          {video.hashtags && (
            <div className="mt-2 text-sm text-blue-400">{video.hashtags}</div>
          )}
        </div>

        {/* Score panel */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 space-y-6">
          <div className="flex flex-col items-center gap-2">
            <ScoreGauge score={analysis.overallScore} size="lg" />
            <p className="text-sm text-gray-500">Overall Score</p>
          </div>

          <div className="text-xs text-gray-600 text-center">
            Analyzed {formatDate(analysis.createdAt)}
          </div>

          {analysis.overallScoreExplanation && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mt-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 text-center">
                Score Explanation
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed text-right" dir="rtl">
                {analysis.overallScoreExplanation}
              </p>
            </div>
          )}

          {/* Quick summary */}
          <div className="space-y-3 border-t border-gray-800 pt-4">
            <div>
              <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1">
                What Worked
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed text-right" dir="rtl">
                {analysis.whatWorked}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Summary */}
      {analysis.videoSummary && (
        <details className="bg-gray-900 rounded-2xl border border-gray-700 group transition-all">
          <summary className="p-6 cursor-pointer font-semibold text-white list-none flex justify-between items-center" dir="rtl">
            متن کامل و درک هوش مصنوعی از ویدیو
            <span className="text-gray-500 group-open:rotate-180 transition-transform" dir="ltr">▼</span>
          </summary>
          <div className="px-6 pb-6 pt-2 border-t border-gray-800">
            <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line text-right" dir="rtl">
              {analysis.videoSummary}
            </p>
          </div>
        </details>
      )}

      {/* Transcript */}
      {video.transcript && (
        <details className="bg-gray-900 rounded-2xl border border-gray-700 group transition-all">
          <summary className="p-6 cursor-pointer font-semibold text-white list-none flex justify-between items-center">
            Audio Transcript
            <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="px-6 pb-6 pt-2 border-t border-gray-800">
            <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line text-right" dir="rtl">
              {video.transcript}
            </p>
          </div>
        </details>
      )}

      {/* Category scores */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">
          Category Breakdown
        </h2>
        <CategoryScores scores={analysis.categoryScores} />
      </section>

      {/* Why it could/wouldn't work */}
      <section className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-3 text-white">
          Social Performance Outlook
        </h2>
        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line text-right" dir="rtl">
          {analysis.whyItCouldWorkOnSocial}
        </p>
      </section>

      {/* Narrative critique */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">
          Full Critique
        </h2>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <div className="text-gray-300 leading-relaxed text-sm space-y-4 text-right" dir="rtl">
            {analysis.narrativeCritique.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Improvement suggestions */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">
          How to Improve
        </h2>
        <div className="space-y-3">
          {analysis.improvementSuggestions.map((suggestion, i) => (
            <div
              key={i}
              className="flex gap-3 bg-gray-900 rounded-xl p-4 border border-gray-700 flex-row-reverse text-right"
              dir="rtl"
            >
              <span className="text-blue-400 font-bold text-sm flex-shrink-0 w-5 text-left">
                .{i + 1}
              </span>
              <p className="text-gray-300 text-sm leading-relaxed">{suggestion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Train the AI Feedback Form */}
      <section>
        <FeedbackForm analysisId={analysis.id} />
      </section>

      {/* Footer actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex-1 text-center bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors"
        >
          Analyze Another Video
        </Link>
        <Link
          href="/history"
          className="flex-1 text-center bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 px-4 rounded-xl text-sm transition-colors"
        >
          View All Analyses
        </Link>
      </div>
    </div>
  );
}
