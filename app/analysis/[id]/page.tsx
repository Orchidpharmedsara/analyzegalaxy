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
      categoryScores: JSON.parse(analysis.categoryScores ?? '[]'),
      
      // New Social Video Intelligence fields
      pds: analysis.pds,
      bindingGate: analysis.bindingGate,
      bindingGateExplanation: analysis.bindingGateExplanation,
      prescriptions: JSON.parse(analysis.prescriptions || '[]'),
      predictedDropoffs: JSON.parse(analysis.predictedDropoffs || '[]'),
      predictedMetrics: JSON.parse(analysis.predictedMetrics || '{}'),
      healthClaims: JSON.parse(analysis.healthClaims || '[]'),
      policyRiskFlags: JSON.parse(analysis.policyRiskFlags || '[]'),
      fearOpened: analysis.fearOpened,
      fearResolved: analysis.fearResolved,
      captionPackage: JSON.parse(analysis.captionPackage || '{}'),
      insightsChecklist: JSON.parse(analysis.insightsChecklist || '[]'),
      videoSummary: analysis.videoSummary,
      whatWorked: analysis.whatWorked,
      whyItCouldWorkOnSocial: analysis.whyItCouldWorkOnSocial,
      narrativeCritique: analysis.narrativeCritique,
      improvementSuggestions: JSON.parse(analysis.improvementSuggestions ?? '[]'),
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
            <ScoreGauge score={analysis.pds ?? analysis.overallScore ?? 0} size="lg" />
            <p className="text-sm text-gray-400 font-semibold tracking-wide uppercase">
              {analysis.pds != null ? 'Predicted Distribution Score (PDS)' : 'Overall Score'}
            </p>
          </div>

          <div className="text-xs text-gray-600 text-center">
            Analyzed {formatDate(analysis.createdAt)}
          </div>

          {analysis.bindingGate && (
            <div className="bg-red-900/30 rounded-xl p-4 border border-red-700/50 mt-4 text-center">
              <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">
                Binding Constraint (Gate)
              </h4>
              <p className="text-sm text-gray-200 font-medium">
                {analysis.bindingGate.replace(/_/g, ' ').toUpperCase()}
              </p>
            </div>
          )}

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

          {/* Quick summary / what worked */}
          {analysis.whatWorked && (
            <div className="space-y-3 border-t border-gray-800 pt-4">
              <div>
                <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1 text-center">
                  What Worked
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed text-right" dir="rtl">
                  {analysis.whatWorked}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Prescriptions */}
      {analysis.prescriptions && analysis.prescriptions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 text-white">Top Prescriptions (Ranked by Lift/Effort)</h2>
          <div className="space-y-4">
            {analysis.prescriptions.map((p, i) => (
              <div key={i} className="bg-blue-900/20 border border-blue-800/50 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-3 border-b border-blue-900/50 pb-3">
                  <div className="text-right flex-1" dir="rtl">
                    <span className="font-bold text-blue-400 text-sm bg-blue-900/40 px-2 py-1 rounded ml-2">
                      {p.category}
                    </span>
                    <span className="text-gray-200 text-sm font-semibold">{p.change}</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded">Effort: {p.effort}</span>
                    <span className="bg-green-900/40 text-green-400 px-2 py-1 rounded">Lift: +{p.expected_pds_delta} PDS</span>
                  </div>
                </div>
                {p.rewrite && p.rewrite.hook_options && (
                  <div className="mt-3 text-right" dir="rtl">
                    <p className="text-xs text-gray-500 mb-2">پیشنهاد متن جایگزین:</p>
                    <ul className="space-y-2">
                      {p.rewrite.hook_options.map((opt: any, j: number) => (
                        <li key={j} className="text-sm text-gray-300">
                          <span className="text-blue-300">"{opt.text_fa}"</span> — <span className="text-gray-500">{opt.why}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Health & Policy Flags */}
      {((analysis.healthClaims && analysis.healthClaims.length > 0) || (analysis.policyRiskFlags && analysis.policyRiskFlags.length > 0)) && (
        <section className="bg-gray-900 rounded-2xl p-6 border border-orange-900/50">
          <h2 className="text-lg font-semibold mb-4 text-orange-400">Health Claims & Policy Risks</h2>
          <div className="space-y-4 text-right" dir="rtl">
            {analysis.healthClaims && analysis.healthClaims.map((claim, i) => (
              <div key={i} className="border-b border-gray-800 pb-3 last:border-0">
                <p className="text-sm text-gray-200 font-medium">{claim.claim}</p>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className={`px-2 py-0.5 rounded ${claim.class === 'established' ? 'bg-green-900/40 text-green-400' : 'bg-orange-900/40 text-orange-400'}`}>
                    {claim.class}
                  </span>
                  <span className="text-gray-500">{claim.timestamp}s</span>
                  <span className="text-gray-400">— {claim.note}</span>
                </div>
              </div>
            ))}
            {analysis.policyRiskFlags && analysis.policyRiskFlags.map((flag, i) => (
              <div key={i} className="bg-red-900/20 text-red-400 p-2 rounded text-sm flex gap-2 items-center">
                <span className="font-bold">⚠️ Risk ({flag.severity}):</span>
                <span>{flag.type}</span>
                <span className="text-red-500">at {flag.timestamp}s</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Caption Package */}
      {analysis.captionPackage && Object.keys(analysis.captionPackage).length > 0 && (
        <section className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-white">Caption & Social SEO Package</h2>
          <div className="text-right space-y-4" dir="rtl">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">کپشن کامل</p>
              <div className="bg-gray-800 rounded p-3 text-sm text-gray-300 whitespace-pre-line">
                {analysis.captionPackage.full_caption}
              </div>
            </div>
            {analysis.captionPackage.search_keywords && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">کلمات کلیدی سئو</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.captionPackage.search_keywords.map((kw: string, i: number) => (
                    <span key={i} className="bg-gray-800 text-blue-300 px-2 py-1 rounded text-xs">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

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
        <CategoryScores scores={analysis.categoryScores ?? []} />
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
            {(analysis.narrativeCritique ?? '').split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy Improvement suggestions (Fallback) */}
      {analysis.improvementSuggestions && analysis.improvementSuggestions.length > 0 && (!analysis.prescriptions || analysis.prescriptions.length === 0) && (
        <section>
          <h2 className="text-lg font-semibold mb-4 text-white">
            How to Improve (Legacy)
          </h2>
          <div className="space-y-3">
            {(analysis.improvementSuggestions ?? []).map((suggestion, i) => (
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
      )}

      {/* Insights Checklist */}
      {analysis.insightsChecklist && analysis.insightsChecklist.length > 0 && (
        <section className="bg-indigo-900/20 rounded-2xl p-6 border border-indigo-900/50">
          <h2 className="text-lg font-semibold mb-3 text-indigo-400">
            What to Check in Insights (Validation)
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm leading-relaxed text-right" dir="rtl">
            {analysis.insightsChecklist.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

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
