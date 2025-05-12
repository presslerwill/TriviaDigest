'use client';
import { useState } from 'react';

type Props = {
  score: number;
  onSubmit: () => void;
};

export default function ScoreDisplay({ score, onSubmit }: Props) {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareText, setShareText] = useState('');

  const handleSubmit = async () => {
    if (!username) return alert('Please enter a username.');
    setLoading(true);

    const res = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify({ username, score }),
      headers: { 'Content-Type': 'application/json' },
    });

    setLoading(false);
    if (!res.ok) return alert('Failed to submit score.');
    setSubmitted(true);
    onSubmit();

    const today = new Date().toISOString().split('T')[0];
    setShareText(`I scored ${score}/1 on today's trivia (${today})! Can you beat me? 🤔 https://your-domain.com`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl mx-auto mt-6 text-center">
      <h2 className="text-xl font-semibold mb-4">You got {score}/1!</h2>

      {!submitted ? (
        <>
          <input
            type="text"
            placeholder="Enter a username"
            className="border px-4 py-2 rounded w-2/3 mb-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Score'}
          </button>
        </>
      ) : (
        <>
          <p className="text-green-600 font-medium mb-4">Score submitted! ✅</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareText);
              alert('Score copied to clipboard!');
            }}
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            Share My Score
          </button>
        </>
      )}
    </div>
  );
}
