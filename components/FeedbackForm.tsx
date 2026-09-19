'use client';

import { useState } from 'react';

export default function FeedbackForm({ analysisId }: { analysisId: string }) {
  const [rating, setRating] = useState<number>(0);
  const [correction, setCorrection] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId, rating, correction }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit feedback.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-900/30 border border-green-800 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">🎓</div>
        <h3 className="text-green-400 font-medium text-lg">Thank you for teaching the AI!</h3>
        <p className="text-gray-400 text-sm mt-1">This data will be used to fine-tune the model.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
      <h2 className="text-lg font-semibold mb-2 text-white">Train the AI (Feedback)</h2>
      <p className="text-gray-400 text-sm mb-4">
        Was this analysis accurate? Submit your rating and corrections to improve future performance.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Accuracy Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => { setRating(star); setError(null); }}
                className={`text-2xl transition-transform hover:scale-110 ${
                  rating >= star ? 'text-yellow-400' : 'text-gray-600'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Correction Box */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">What did it get wrong? (Optional)</label>
          <textarea
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
            rows={3}
            placeholder="E.g., The hook was actually visual, not audio..."
            dir="auto"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-medium py-2 px-6 rounded-xl text-sm transition-colors"
        >
          {loading ? 'Saving...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
