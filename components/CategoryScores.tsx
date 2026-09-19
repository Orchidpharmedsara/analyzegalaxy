'use client';

import { useState } from 'react';
import type { CategoryScore } from '@/lib/types';

interface CategoryScoresProps {
  scores: CategoryScore[];
}

function getBarColor(score: number): string {
  if (score >= 8) return 'bg-green-500';
  if (score >= 6) return 'bg-yellow-500';
  if (score >= 4) return 'bg-orange-500';
  return 'bg-red-500';
}

function getScoreTextColor(score: number): string {
  if (score >= 8) return 'text-green-400';
  if (score >= 6) return 'text-yellow-400';
  if (score >= 4) return 'text-orange-400';
  return 'text-red-400';
}

export default function CategoryScores({ scores }: CategoryScoresProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {scores.map((item, i) => (
        <div
          key={i}
          className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors"
        >
          <button
            className="w-full px-4 py-3 flex items-center gap-3 text-left"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            {/* Score badge */}
            <span
              className={`text-lg font-bold tabular-nums w-8 text-right flex-shrink-0 ${getScoreTextColor(item.score)}`}
            >
              {item.score}
            </span>

            {/* Category name */}
            <span className="flex-1 text-sm font-medium text-gray-200 text-right" dir="rtl">
              {item.category}
            </span>

            {/* Progress bar */}
            <div className="w-24 h-2 bg-gray-700 rounded-full flex-shrink-0">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getBarColor(item.score)}`}
                style={{ width: `${(item.score / 10) * 100}%` }}
              />
            </div>

            {/* Expand toggle */}
            <svg
              className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${
                expanded === i ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {expanded === i && (
            <div className="px-4 pb-3 border-t border-gray-700">
              <p className="text-sm text-gray-400 mt-2 leading-relaxed text-right" dir="rtl">
                {item.reason}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
