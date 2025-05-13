'use client';
import { useEffect, useState } from 'react';

type Score = {
  username: string;
  score: number;
  date: string;
  time?: number;
};

export default function LeaderboardTable() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      const today = new Date().toISOString().split('T')[0];

      const res = await fetch(`/api/leaderboard?date=${today}`);
      const data = await res.json();
      console.log('Leaderboard API response:', data);
      setScores(Array.isArray(data) ? data : []);
      setLoading(false);
    };

    fetchScores();
  }, []);

  if (loading) return <p className="text-center">Loading leaderboard...</p>;

  if (!Array.isArray(scores) || scores.length === 0) {
    return <p className="text-center">No scores yet for today.</p>;
  }

  return (
    <div className="bg-[var(--background)] p-6 rounded-xl shadow-md w-full max-w-xl mx-auto mt-10 border border-[var(--foreground)]">
      <h2 className="text-2xl font-semibold mb-4 text-center">🏆 Leaderboard</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[var(--foreground)]">
            <th className="py-2">#</th>
            <th className="py-2">Username</th>
            <th className="py-2">Score</th>
            <th className="py-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, i) => (
            <tr key={i} className="border-t border-[var(--foreground)]">
              <td className="py-2">{i + 1}</td>
              <td className="py-2">{s.username}</td>
              <td className="py-2">{s.score}</td>
              <td className="py-2">{typeof s.time === 'number' ? s.time : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
