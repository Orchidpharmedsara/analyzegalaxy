import { notFound } from 'next/navigation';
import Link from 'next/link';
import ScoreGauge from '@/components/ScoreGauge';
import VideoPlayer from '@/components/VideoPlayer';
import FeedbackForm from '@/components/FeedbackForm';
import { prisma } from '@/lib/db';

async function getAnalysis(id: string) {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: { video: true },
    });

    if (!analysis) return null;

    return {
      ...analysis,
      scores: JSON.parse(analysis.scores || '{}'),
      evidence: JSON.parse(analysis.evidence || '{"observed":[],"calculated":[],"predicted":[],"inferred":[],"unknown":[]}'),
      timeline: JSON.parse(analysis.timeline || '[]'),
      strengths: JSON.parse(analysis.strengths || '[]'),
      weaknesses: JSON.parse(analysis.weaknesses || '[]'),
      riskPoints: JSON.parse(analysis.riskPoints || '[]'),
      experiments: JSON.parse(analysis.experiments || '[]'),
    };
  } catch (err) {
    console.error('Failed to get analysis from db:', err);
    return null;
  }
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

      {/* Header: video + overall scores */}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2">
              <ScoreGauge score={analysis.performancePotential ?? 0} size="md" />
              <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase text-center">
                Performance Potential
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ScoreGauge score={analysis.growthPotential ?? 0} size="md" />
              <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase text-center">
                Growth Potential
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ScoreGauge score={analysis.experimentValue ?? 0} size="md" />
              <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase text-center">
                Experiment Value
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ScoreGauge score={analysis.evidenceConfidence ?? 0} size="md" />
              <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase text-center">
                Evidence Confidence
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">
          Category Breakdown
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(analysis.scores || {}).map(([key, data]: [string, any]) => {
            const scoreVal = typeof data === 'number' ? data : data.score;
            const reason = data.reason;
            const what_would_be_100 = data.what_would_be_100;

            return (
              <div key={key} className="bg-gray-900 rounded-xl p-5 border border-gray-700 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-400 uppercase tracking-wide font-semibold">{key}</span>
                  <span className="text-2xl font-bold text-white">{scoreVal}</span>
                </div>
                
                {reason && (
                  <div className="text-right mt-2" dir="rtl">
                    <p className="text-xs text-gray-500 mb-1">دلیل این امتیاز:</p>
                    <p className="text-sm text-gray-300">{reason}</p>
                  </div>
                )}
                
                {what_would_be_100 && (
                  <div className="text-right mt-3 bg-blue-900/10 p-3 rounded-lg border border-blue-900/30" dir="rtl">
                    <p className="text-xs text-blue-400/80 mb-1">چگونه ۱۰۰ می‌شد؟</p>
                    <p className="text-sm text-blue-200">{what_would_be_100}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Strengths and Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-green-900/10 rounded-2xl p-6 border border-green-900/30">
          <h2 className="text-lg font-semibold mb-4 text-green-400">Strengths</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm text-right" dir="rtl">
            {(analysis.strengths || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
          </ul>
        </section>
        <section className="bg-red-900/10 rounded-2xl p-6 border border-red-900/30">
          <h2 className="text-lg font-semibold mb-4 text-red-400">Weaknesses</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm text-right" dir="rtl">
            {(analysis.weaknesses || []).map((w: string, i: number) => <li key={i}>{w}</li>)}
          </ul>
        </section>
      </div>

      {/* Risk Points */}
      {analysis.riskPoints && analysis.riskPoints.length > 0 && (
        <section className="bg-orange-900/10 rounded-2xl p-6 border border-orange-900/30">
          <h2 className="text-lg font-semibold mb-4 text-orange-400">Risk Points (Drop-offs & Dead Seconds)</h2>
          <div className="space-y-4 text-right" dir="rtl">
            {analysis.riskPoints.map((rp: any, i: number) => (
              <div key={i} className="border-b border-gray-800 pb-4 last:border-0">
                <div className="flex gap-3 justify-end items-center mb-2">
                  <span className="text-orange-300 font-semibold">{rp.timestamp}s</span>
                  {rp.duration && <span className="text-gray-500 text-xs">({rp.duration}s duration)</span>}
                  <span className="bg-orange-900/40 text-orange-400 text-xs px-2 py-1 rounded">Severity: {rp.severity}</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{rp.reason}</p>
                <p className="text-sm text-blue-300 bg-blue-900/20 p-2 rounded">پبشنهاد: {rp.suggested_edit}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Raw Transcript */}
      {video.transcript && (
        <details className="bg-gray-900 rounded-2xl border border-gray-700 group transition-all">
          <summary className="p-6 cursor-pointer font-semibold text-white list-none flex justify-between items-center" dir="rtl">
            متن کامل صدای ویدیو (Transcript)
            <span className="text-gray-500 group-open:rotate-180 transition-transform" dir="ltr">▼</span>
          </summary>
          <div className="px-6 pb-6 pt-2 border-t border-gray-800">
            <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line text-right" dir="rtl">
              {video.transcript}
            </p>
          </div>
        </details>
      )}

      {/* Timeline */}
      {analysis.timeline && analysis.timeline.length > 0 && (
        <section className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-white">Scene-by-Scene Timeline</h2>
          <div className="space-y-4 text-right" dir="rtl">
            {analysis.timeline.map((scene: any, i: number) => (
              <div key={i} className="border-l-2 border-gray-800 pr-4 pb-4 last:pb-0 relative">
                <div className="absolute right-[-9px] top-1 w-4 h-4 rounded-full bg-gray-700 border-2 border-gray-900"></div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-400 font-mono text-sm">{scene.start_time}s - {scene.end_time}s</span>
                  {scene.retention_risk_score > 7 && <span className="text-red-400 text-xs">⚠️ خطر ریزش بالا</span>}
                </div>
                <p className="text-sm text-gray-300 mb-1"><span className="text-gray-500">صحنه:</span> {scene.visual_description}</p>
                <p className="text-sm text-gray-300 mb-1"><span className="text-gray-500">صدا:</span> {scene.audio_description}</p>
                <p className="text-sm text-gray-300 mb-1"><span className="text-gray-500">متن:</span> {scene.transcript}</p>
                <p className="text-sm text-gray-300 mb-2"><span className="text-gray-500">هدف:</span> {scene.scene_function}</p>
                {scene.edit_recommendation && (
                  <p className="text-sm text-blue-300 bg-blue-900/20 p-2 rounded">{scene.edit_recommendation}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experiments */}
      {analysis.experiments && analysis.experiments.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 text-white">Recommended Experiments</h2>
          <div className="space-y-4">
            {analysis.experiments.map((exp: any, i: number) => (
              <div key={i} className="bg-indigo-900/20 border border-indigo-900/50 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-3 border-b border-indigo-900/50 pb-3">
                  <div className="text-right flex-1" dir="rtl">
                    <span className="font-bold text-indigo-400 text-sm bg-indigo-900/40 px-2 py-1 rounded ml-2">
                      آزمایش {i + 1}: {exp.variable}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-right" dir="rtl">
                  <p className="text-sm text-gray-300 mb-2"><span className="text-gray-500">فرضیه:</span> {exp.hypothesis}</p>
                  <p className="text-sm text-gray-300 mb-1"><span className="text-red-400 font-medium">نسخه فعلی (Control):</span> {exp.control}</p>
                  <p className="text-sm text-gray-300 mb-3"><span className="text-green-400 font-medium">نسخه جدید (Variant):</span> {exp.variant}</p>
                  <div className="flex gap-3 text-xs justify-end">
                    <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded">Primary Metric: {exp.primary_metric}</span>
                    <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded">Secondary: {exp.secondary_metric}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Evidence */}
      {analysis.evidence && (
        <details className="bg-gray-900 rounded-2xl border border-gray-700 group transition-all">
          <summary className="p-6 cursor-pointer font-semibold text-white list-none flex justify-between items-center" dir="rtl">
            داده‌های تحلیل شده (Evidence)
            <span className="text-gray-500 group-open:rotate-180 transition-transform" dir="ltr">▼</span>
          </summary>
          <div className="px-6 pb-6 pt-2 border-t border-gray-800">
            <div className="space-y-4 text-right" dir="rtl">
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">داده‌های قطعی (Observed)</h4>
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                  {(analysis.evidence.observed || []).map((e: string, i: number) => <li key={i}>{e}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">استنتاج‌ها (Inferred)</h4>
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                  {(analysis.evidence.inferred || []).map((e: string, i: number) => <li key={i}>{e}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">داده‌های ناشناخته (Unknown)</h4>
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                  {(analysis.evidence.unknown || []).map((e: string, i: number) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </details>
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
