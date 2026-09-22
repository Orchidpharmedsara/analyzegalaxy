import { notFound } from 'next/navigation';
import Link from 'next/link';
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
  
  // Use the parsed JSON from the db
  const nodeA = analysis.scores || {};
  const nodeB = analysis.evidence || {};
  const nodeC = analysis.timeline || {};

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

      {/* Header: video metadata */}
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
            {video.duration != null && (
              <span>⏱ {formatDuration(video.duration)}</span>
            )}
            {video.resolution && <span>📐 {video.resolution}</span>}
            {video.fps != null && <span>🎥 {video.fps}fps</span>}
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

        {/* Prediction Panel */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 space-y-6">
          <h2 className="text-xl font-bold text-white text-right" dir="rtl">
            پیش‌بینی مربی (Coach Prediction)
          </h2>
          <div className="bg-indigo-900/20 p-5 rounded-xl border border-indigo-900/50 text-right" dir="rtl">
            <p className="text-lg text-indigo-300 font-medium leading-relaxed">
              {nodeC.prediction || 'در حال تحلیل...'}
            </p>
          </div>
        </div>
      </div>

      {/* 3-Step AI Chain Analysis */}
      <div className="space-y-6">
        
        {/* Node B: The Skeptic (Critique) */}
        <section className="bg-red-900/10 rounded-2xl p-6 border border-red-900/30">
          <h2 className="text-xl font-bold mb-4 text-red-400 text-right" dir="rtl">
            نقد الگوریتم (The Skeptic)
          </h2>
          <p className="text-sm text-red-300/80 mb-4 text-right" dir="rtl">
            دلایلی که باعث می‌شود کاربر ویدیو را رد کند (Swipe away):
          </p>
          <div className="space-y-3 text-right" dir="rtl">
            {Array.isArray(nodeB.reasons) ? (
              nodeB.reasons.map((reason: string, i: number) => (
                <div key={i} className="flex gap-3 justify-start flex-row-reverse bg-red-900/20 p-4 rounded-lg">
                  <span className="text-red-500 font-bold">✖</span>
                  <p className="text-red-200 text-sm leading-relaxed">{reason}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">نظری یافت نشد.</p>
            )}
          </div>
        </section>

        {/* Node C: The Coach (Actionable Advice) */}
        <section className="bg-blue-900/10 rounded-2xl p-6 border border-blue-900/30">
          <h2 className="text-xl font-bold mb-4 text-blue-400 text-right" dir="rtl">
            توصیه مربی (The Coach)
          </h2>
          <div className="space-y-4 text-right" dir="rtl">
            {nodeC.why_it_will_fail && (
              <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">چرا این ویدیو ممکن است شکست بخورد؟</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{nodeC.why_it_will_fail}</p>
              </div>
            )}
            
            {nodeC.how_to_fix_it && (
              <div className="bg-green-900/20 p-5 rounded-xl border border-green-900/40">
                <h3 className="text-sm font-semibold text-green-400 mb-2">چگونه آن را اصلاح کنیم؟ (Actionable Fix)</h3>
                <p className="text-green-200 text-sm leading-relaxed">{nodeC.how_to_fix_it}</p>
              </div>
            )}

            {nodeC.unknowns && (
              <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">مجهولات (مسائلی که مشخص نیست)</h3>
                <p className="text-gray-400 text-sm leading-relaxed italic">{nodeC.unknowns}</p>
              </div>
            )}
          </div>
        </section>

        {/* Node A: The Observer (Objective Data) */}
        <section className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white text-right" dir="rtl">
            داده‌های عینی (The Observer)
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-right" dir="rtl">
            {nodeA.first_3_seconds_visuals && (
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">۳ ثانیه اول (بصری)</p>
                <p className="text-sm text-gray-200">{nodeA.first_3_seconds_visuals}</p>
              </div>
            )}
            
            {nodeA.promised_value && (
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">ارزش وعده داده شده (Hook)</p>
                <p className="text-sm text-gray-200">{nodeA.promised_value}</p>
              </div>
            )}

            {nodeA.cuts_per_second != null && (
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">سرعت کات (Cuts per second)</p>
                <p className="text-lg font-bold text-gray-200">{nodeA.cuts_per_second}</p>
              </div>
            )}

            {nodeA.call_to_action && (
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">دعوت به اقدام (CTA)</p>
                <p className="text-sm text-gray-200">{nodeA.call_to_action}</p>
              </div>
            )}
          </div>
          
          {Array.isArray(nodeA.on_screen_text) && nodeA.on_screen_text.length > 0 && (
            <div className="mt-4 bg-gray-800 rounded-xl p-4 text-right" dir="rtl">
              <p className="text-xs text-gray-500 mb-2">متن‌های روی تصویر</p>
              <div className="flex flex-wrap gap-2 justify-end">
                {nodeA.on_screen_text.map((text: string, i: number) => (
                  <span key={i} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                    {text}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

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
