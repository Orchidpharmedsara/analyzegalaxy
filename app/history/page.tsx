'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnalysisCard from '@/components/AnalysisCard';

interface AnalysisSummary {
  id: string;
  videoId: string;
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

type SortField = 'date' | 'score';
type SortOrder = 'asc' | 'desc';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/analyses?sort=${sortField}&order=${sortOrder}&limit=100`)
      .then((r) => r.json())
      .then((data) => {
        setAnalyses(data.analyses || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analysis History</h1>
          {!loading && (
            <p className="text-gray-500 text-sm mt-1">
              {total} {total === 1 ? 'analysis' : 'analyses'} saved
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort controls */}
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">Sort:</span>
            <button
              onClick={() => toggleSort('date')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                sortField === 'date'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Date {sortField === 'date' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
            <button
              onClick={() => toggleSort('score')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                sortField === 'score'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Score {sortField === 'score' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
          </div>

          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-1.5 px-4 rounded-lg text-sm transition-colors"
          >
            + New
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-800 rounded-xl aspect-[4/3] animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-gray-400 hover:text-white underline"
          >
            Try again
          </button>
        </div>
      ) : analyses.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="text-5xl">📭</div>
          <p className="text-gray-400 text-lg">No analyses yet</p>
          <p className="text-gray-500 text-sm">
            Analyze your first video to see it here.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-xl text-sm transition-colors"
          >
            Analyze a Video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyses.map((analysis) => (
            <AnalysisCard key={analysis.id} {...analysis} />
          ))}
        </div>
      )}
    </div>
  );
}
