'use client';
import { useEffect, useState } from 'react';

type Score = {
  username: string;
  score: number;
  created_at: string;
};

export default function LeaderboardTable() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      const today = new Date().toISOString().split('T')[0];

      const res = await fetch(`/api/leaderboard?date=${today}`);
      const data = await res.json();
      setScores(data);
      setLoading(false);
    };

    fetchScores();
  }, []);

  if (loading) return <p className="text-center">Loading leaderboard...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-center">🏆 Leaderboard</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">#</th>
            <th className="py-2">Username</th>
            <th className="py-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, i) => (
            <tr key={i} className="border-t">
              <td className="py-2">{i + 1}</td>
              <td className="py-2">{s.username}</td>
              <td className="py-2">{s.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
