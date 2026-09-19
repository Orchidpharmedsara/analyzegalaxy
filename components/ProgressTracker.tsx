'use client';

import type { AnalysisStatus } from '@/lib/types';

interface Step {
  status: AnalysisStatus;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  { status: 'downloading', label: 'Downloading', description: 'Fetching video from Instagram' },
  { status: 'processing', label: 'Processing', description: 'Extracting metadata & thumbnail' },
  { status: 'transcribing', label: 'Transcribing', description: 'Converting audio to text' },
  { status: 'analyzing', label: 'Analyzing', description: 'Running Gemini AI analysis' },
  { status: 'generating', label: 'Generating', description: 'Writing structured analysis' },
  { status: 'saving', label: 'Saving', description: 'Storing results' },
];

const STATUS_ORDER: AnalysisStatus[] = [
  'downloading',
  'processing',
  'transcribing',
  'analyzing',
  'generating',
  'saving',
  'done',
];

interface ProgressTrackerProps {
  status: AnalysisStatus;
  message: string;
  isUpload?: boolean;
}

export default function ProgressTracker({
  status,
  message,
  isUpload = false,
}: ProgressTrackerProps) {
  const steps = isUpload
    ? STEPS.filter((s) => s.status !== 'downloading')
    : STEPS;

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="space-y-6">
      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const stepIndex = STATUS_ORDER.indexOf(step.status);
          const isCompleted = currentIndex > stepIndex || status === 'done';
          const isActive = step.status === status;
          const isPending = currentIndex < stepIndex && status !== 'done';

          return (
            <div key={step.status} className="flex items-center gap-3">
              {/* Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500'
                    : isActive
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-gray-700'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  <div className="w-3 h-3 bg-white rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-gray-500 rounded-full" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </p>
                {isActive && (
                  <p className="text-xs text-gray-400">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current status message */}
      <div className="bg-gray-800 rounded-lg px-4 py-3 border border-gray-700">
        <p className="text-sm text-gray-300">{message}</p>
      </div>
    </div>
  );
}
