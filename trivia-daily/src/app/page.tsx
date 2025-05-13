'use client';
import { useState, useRef } from 'react';
import TriviaCard from '@/components/TriviaCard';
import ScoreDisplay from '@/components/ScoreDisplay';
import LeaderboardTable from '@/components/LeaderboardTable';

export default function HomePage() {
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = () => {
    setStarted(true);
    setTimer(0);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const handleScore = (score: number) => {
    setScore(score);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-6">🧠 Daily Trivia Challenge</h1>

      {/* Show Start button first */}
      {!started && (
        <div className="flex flex-col items-center">
          <button
            className="bg-[var(--foreground)] text-[var(--background)] px-6 py-3 rounded text-xl font-semibold hover:bg-opacity-90 transition-colors mb-4"
            onClick={handleStart}
          >
            Start
          </button>
        </div>
      )}

      {/* Show timer if started and not submitted */}
      {started && score === null && !submitted && (
        <div className="text-center mb-4 text-lg">Time: {timer}s</div>
      )}

      {/* Show trivia game after starting */}
      {started && score === null ? (
        <TriviaCard onScore={handleScore} />
      ) : (
        started && score !== null && (
          <ScoreDisplay score={score} timer={timer} onSubmit={() => setSubmitted(true)} />
        )
      )}

      {/* Show leaderboard after submitting score */}
      {submitted && <LeaderboardTable />}
    </main>
  );
}
