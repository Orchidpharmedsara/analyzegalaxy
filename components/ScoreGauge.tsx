'use client';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green-500
  if (score >= 60) return '#eab308'; // yellow-500
  if (score >= 40) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'Average';
  if (score >= 40) return 'Weak';
  return 'Poor';
}

export default function ScoreGauge({ score, size = 'md' }: ScoreGaugeProps) {
  const sizes = {
    sm: { width: 80, stroke: 8, fontSize: 20, labelSize: 11 },
    md: { width: 140, stroke: 12, fontSize: 36, labelSize: 13 },
    lg: { width: 180, stroke: 14, fontSize: 48, labelSize: 15 },
  };

  const { width, stroke, fontSize, labelSize } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width, height: width }}>
        <svg
          width={width}
          height={width}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background track */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="#1f2937"
            strokeWidth={stroke}
          />
          {/* Progress arc */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        {/* Score text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ color }}
        >
          <span style={{ fontSize, fontWeight: 700, lineHeight: 1 }}>{score}</span>
          {size !== 'sm' && (
            <span
              style={{
                fontSize: labelSize,
                color: '#9ca3af',
                marginTop: 2,
                fontWeight: 500,
              }}
            >
              /100
            </span>
          )}
        </div>
      </div>
      {size !== 'sm' && (
        <span
          className="text-sm font-semibold"
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
