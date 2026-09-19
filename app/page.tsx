'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProgressTracker from '@/components/ProgressTracker';
import type { AnalysisStatus, ProgressEvent } from '@/lib/types';

type InputMode = 'url' | 'upload';

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<InputMode>('url');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('video/')) {
      setFile(dropped);
    } else {
      setError('Please drop a video file (MP4, MOV, WebM, etc.)');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validate input
    if (mode === 'url') {
      if (!url.trim()) {
        setError('Please enter an Instagram URL.');
        setIsSubmitting(false);
        return;
      }
      try {
        new URL(url.trim());
      } catch {
        setError('Please enter a valid URL.');
        setIsSubmitting(false);
        return;
      }
    } else {
      if (!file) {
        setError('Please select a video file.');
        setIsSubmitting(false);
        return;
      }
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        setError('File too large. Maximum size is 500MB.');
        setIsSubmitting(false);
        return;
      }
    }

    // Build form data
    const formData = new FormData();
    if (mode === 'url') {
      formData.append('url', url.trim());
    } else if (file) {
      formData.append('file', file);
    }

    // Open SSE connection
    setStatus(mode === 'url' ? 'downloading' : 'processing');
    setStatusMessage('Starting...');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.body) {
        throw new Error('No response stream received.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: ProgressEvent = JSON.parse(line.slice(6));
              setStatus(event.status);
              setStatusMessage(event.message);

              if (event.status === 'generating') {
                setStatus('generating');
                setStatusMessage(event.message);
                if (event.rawText) {
                  setRawText(event.rawText);
                }
              } else if (event.status === 'done' && event.analysisId) {
                router.push(`/analysis/${event.analysisId}`);
                return;
              }

              if (event.status === 'error') {
                setError(event.error || event.message);
                setIsSubmitting(false);
                setStatus('idle');
                return;
              }
            } catch {
              // Ignore malformed SSE lines
            }
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Something went wrong: ${message}`);
      setIsSubmitting(false);
      setStatus('idle');
    }
  };

  const isProcessing = isSubmitting && status !== 'idle' && status !== 'error';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">
          Video Performance Analyzer
        </h1>
        <p className="text-gray-400 text-base leading-relaxed">
          Get an honest, detailed critique of any short-form video — scored
          across 10 social media performance categories by Gemini AI.
        </p>
      </div>

      {isProcessing ? (
        /* Progress view */
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
          <h2 className="text-lg font-semibold mb-6 text-white">Analyzing your video...</h2>
          <ProgressTracker
            status={status}
            message={statusMessage}
            isUpload={mode === 'upload'}
          />
          
          {status === 'generating' && rawText && (
            <div className="mt-6 bg-black rounded-xl p-4 border border-gray-800 h-64 overflow-y-auto font-mono text-xs text-green-400">
              <pre className="whitespace-pre-wrap">{rawText}</pre>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-6">
            This typically takes 15–30 seconds. Don't close this tab.
          </p>
        </div>
      ) : (
        /* Input form */
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 rounded-2xl p-8 border border-gray-700 space-y-6"
        >
          {/* Mode toggle */}
          <div className="flex gap-2 p-1 bg-gray-800 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode('url'); setError(null); }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all ${
                mode === 'url'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📸 Instagram URL
            </button>
            <button
              type="button"
              onClick={() => { setMode('upload'); setError(null); }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all ${
                mode === 'upload'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📁 Upload Video
            </button>
          </div>

          {/* URL input */}
          {mode === 'url' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Instagram Reel or Post URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                autoFocus
              />
              <p className="text-xs text-gray-500">
                Only public Instagram posts/Reels are supported. Requires{' '}
                <code className="bg-gray-800 px-1 py-0.5 rounded">yt-dlp</code> to be
                installed.
              </p>
            </div>
          )}

          {/* File upload */}
          {mode === 'upload' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Video File
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : file
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 hover:border-gray-400'
                }`}
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm,video/x-matroska,.mp4,.mov,.webm,.mkv,.avi"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setFile(f); setError(null); }
                  }}
                />
                {file ? (
                  <div>
                    <p className="text-green-400 font-medium">{file.name}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-xs text-gray-400 mt-2 hover:text-white underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-3">🎬</div>
                    <p className="text-gray-300 font-medium">
                      Drop video here or click to browse
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      MP4, MOV, WebM, MKV — up to 500MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-950/50 border border-red-800 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
          >
            Analyze Video →
          </button>
        </form>
      )}

      {/* Tips */}
      {!isProcessing && (
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🎯', label: '10 categories', desc: 'Hook, pacing, audio, and more' },
            { icon: '📊', label: 'Scored 0–100', desc: 'With per-category breakdown' },
            { icon: '🔍', label: 'Honest critique', desc: 'No generic praise — real feedback' },
          ].map((tip) => (
            <div key={tip.label} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="text-2xl mb-1">{tip.icon}</div>
              <div className="text-sm font-medium text-gray-300">{tip.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{tip.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
