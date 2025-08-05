'use client';
import { useEffect, useState } from 'react';

type Props = {
  score: number;
  timer: number;
  maxScore: number;
  onSubmit: () => void;
};

export default function ScoreDisplay({ score, timer, maxScore, onSubmit }: Props) {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareText, setShareText] = useState('');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('trivia-username') : '';
    if (saved) setUsername(saved);
  }, []);

  const handleSubmit = async () => {
    if (!username) return alert('Please enter a username.');
    setLoading(true);

    const res = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify({ username, score, timer }),
      headers: { 'Content-Type': 'application/json' },
    });

    setLoading(false);
    if (!res.ok) return alert('Failed to submit score.');
    setSubmitted(true);
    onSubmit();

    if (typeof window !== 'undefined') {
      localStorage.setItem('trivia-username', username);
    }

    const today = new Date().toISOString().split('T')[0];
    setShareText(`I scored ${score}/${maxScore} in ${timer}s on today's trivia (${today})! Can you beat me? 🤔 triviadigest.com`);
  };

  return (
    <div className="bg-[var(--background)] p-6 rounded-xl shadow-md w-full max-w-xl mx-auto mt-6 text-center border border-[var(--foreground)]">
      <h2 className="text-xl font-semibold mb-4">You got {score}/{maxScore}!</h2>
      <h3 className="text-lg mb-4">Time: {timer}s</h3>

      {!submitted ? (
        <>
          <input
            type="text"
            placeholder="Enter a username"
            className="border border-[var(--foreground)] bg-[var(--background)] px-4 py-2 rounded w-2/3 mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-50"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          <button
            onClick={handleSubmit}
            className="bg-[var(--foreground)] hover:bg-opacity-90 text-[var(--background)] px-4 py-2 rounded transition-colors"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Score'}
          </button>
        </>
      ) : (
        <>
          <p className="text-green-500 font-medium mb-4">Score submitted! ✅</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareText);
              alert('Score copied to clipboard!');
            }}
            className="bg-[var(--foreground)] text-[var(--background)] px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
          >
            Share My Score
          </button>
        </>
      )}
    </div>
  );
}
