'use client';

import Link from 'next/link';
import Image from 'next/image';
import ScoreGauge from './ScoreGauge';

interface AnalysisCardProps {
  id: string;
  overallScore: number;
  createdAt: string;
  video: {
    sourceType: string;
    thumbnailPath?: string | null;
    duration?: number | null;
    caption?: string | null;
    originalUrl?: string | null;
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function AnalysisCard({
  id,
  overallScore,
  createdAt,
  video,
}: AnalysisCardProps) {
  return (
    <Link href={`/analysis/${id}`}>
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-500 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-900">
          {video.thumbnailPath ? (
            <Image
              src={video.thumbnailPath}
              alt="Video thumbnail"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
          )}

          {/* Source type badge */}
          <div className="absolute top-2 left-2">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                video.sourceType === 'instagram'
                  ? 'bg-pink-500/80 text-white'
                  : 'bg-blue-500/80 text-white'
              }`}
            >
              {video.sourceType === 'instagram' ? '📸 Instagram' : '📁 Upload'}
            </span>
          </div>

          {/* Duration */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex items-start gap-4">
          <ScoreGauge score={overallScore} size="sm" />

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300 truncate">
              {video.caption || video.originalUrl || 'Uploaded video'}
            </p>
            <p className="text-xs text-gray-500 mt-1">{formatDate(createdAt)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
