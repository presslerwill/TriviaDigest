'use client';
import { useState } from 'react';
import TriviaCard from '@/components/TriviaCard';
import ScoreDisplay from '@/components/ScoreDisplay';
import LeaderboardTable from '@/components/LeaderboardTable';

export default function HomePage() {
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-slate-900 py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-white">🧠 Daily Trivia Challenge</h1>

      {/* Show trivia game first */}
      {score === null ? (
        <TriviaCard onScore={setScore} />
      ) : (
        <ScoreDisplay score={score} onSubmit={() => setSubmitted(true)} />
      )}

      {/* Show leaderboard after submitting score */}
      {submitted && <LeaderboardTable />}
    </main>
  );
}
