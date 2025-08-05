'use client';
import { useState, useRef, useEffect } from 'react';
import TriviaCard from '@/components/TriviaCard';
import ScoreDisplay from '@/components/ScoreDisplay';

export default function HomePage() {
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user has played today
    const lastPlayed = localStorage.getItem('lastPlayedDate');
    const today = new Date().toDateString();
    
    if (lastPlayed === today) {
      setHasPlayedToday(true);
    }
  }, []);

  const handleStart = () => {
    // Don't start if already played today
    if (hasPlayedToday) return;
    
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
      <h1 className="text-3xl font-bold text-center mb-6">🧠 Trivia Digest</h1>

      {/* Show Start button first */}
      {!started && !hasPlayedToday && (
        <div className="flex flex-col items-center">
          <button
            className="bg-[var(--foreground)] text-[var(--background)] px-6 py-3 rounded text-xl font-semibold hover:bg-opacity-90 transition-colors mb-4"
            onClick={handleStart}
          >
            Start
          </button>
        </div>
      )}

      {/* Show timer if started and not submitted and hasn't played today */}
      {started && score === null && !submitted && !hasPlayedToday && (
        <div className="text-center mb-4 text-lg">Time: {timer}s</div>
      )}

      {/* Show trivia game after starting */}
      {started && score === null ? (
        <TriviaCard onScore={handleScore} />
      ) : (
        started && score !== null && !hasPlayedToday && (
          <ScoreDisplay score={score} timer={timer} maxScore={1000} onSubmit={() => setSubmitted(true)} />
        )
      )}

      {/* Show leaderboard after submitting score or if already played today */}
      {(submitted || hasPlayedToday) && <TriviaCard onScore={handleScore} />}
    </main>
  );
}
