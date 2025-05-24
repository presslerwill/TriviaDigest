'use client';

export default function AboutModal() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-2">About Daily Trivia</h3>
        <p className="text-[var(--foreground)]/80">
          Daily Trivia is a fun way to test your knowledge with a new question every day. 
          Challenge yourself and compete with others on the leaderboard!
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold mb-2">How to Play</h3>
        <ol className="list-decimal list-inside space-y-2 text-[var(--foreground)]/80">
          <li>Each day, you get one trivia question to answer</li>
          <li>Choose the correct answer to earn 1000 points</li>
          <li>If you&apos;re not sure, you can skip for 500 points</li>
          <li>Your score is based on both accuracy and speed</li>
          <li>Compete with others on the daily leaderboard</li>
        </ol>
      </section>
    </div>
  );
} 