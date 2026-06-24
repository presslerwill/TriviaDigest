'use client';
import { useEffect, useState } from 'react';

type Props = {
  answers: (number | null)[];
  date: string;
  timer: number;
  onSubmit: () => void;
};

export default function ScoreDisplay({ answers, date, timer, onSubmit }: Props) {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareText, setShareText] = useState('');
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [total, setTotal] = useState(answers.length);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('trivia-username') : '';
    if (saved) setUsername(saved);
  }, []);

  const handleSubmit = async () => {
    if (!username.trim()) return alert('Please enter a username.');
    setLoading(true);

    const res = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify({ username: username.trim(), answers, timer, date }),
      headers: { 'Content-Type': 'application/json' },
    });

    setLoading(false);
    if (!res.ok) return alert('Failed to submit score.');

    // The server is the source of truth for the score.
    const result = await res.json();
    const finalTotal = result.total ?? answers.length;
    const finalScore = result.score ?? 0;
    const finalMax = finalTotal * 1000;

    setScore(finalScore);
    setTotal(finalTotal);
    setMaxScore(finalMax);
    setCorrectCount(result.correctCount ?? 0);
    setSubmitted(true);
    onSubmit();

    if (typeof window !== 'undefined') {
      localStorage.setItem('trivia-username', username.trim());
    }

    setShareText(`I scored ${finalScore}/${finalMax} in ${timer}s on today's trivia (${date})! Can you beat me? 🤔 triviadigest.com`);
  };

  return (
    <div className="bg-[var(--background)] p-6 rounded-xl shadow-md w-full max-w-xl mx-auto mt-6 text-center border border-[var(--foreground)]">
      {!submitted ? (
        <>
          <h2 className="text-xl font-semibold mb-2">You finished in {timer}s!</h2>
          <p className="mb-4">Enter a username to submit your answers and see your score.</p>
          <input
            type="text"
            placeholder="Enter a username"
            maxLength={20}
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
            {loading ? 'Submitting...' : 'Submit Answers'}
          </button>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-2">You got {score}/{maxScore}!</h2>
          <h3 className="text-lg mb-4">{correctCount} of {total} correct · {timer}s</h3>
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
