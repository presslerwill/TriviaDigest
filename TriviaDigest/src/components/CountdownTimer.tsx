'use client';

import { useEffect, useState } from 'react';

function getMsUntilNextUtcMidnight(): number {
  const now = new Date();
  const nextMidnightUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0
  );
  return nextMidnightUtc - now.getTime();
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function CountdownTimer() {
  const [msRemaining, setMsRemaining] = useState<number | null>(null);

  useEffect(() => {
    setMsRemaining(getMsUntilNextUtcMidnight());

    const interval = setInterval(() => {
      setMsRemaining(getMsUntilNextUtcMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Avoid rendering a mismatched value during SSR/hydration.
  if (msRemaining === null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-4 px-4 pointer-events-none z-40">
      <div className="pointer-events-auto bg-[var(--background)]/90 border border-[var(--foreground)]/20 rounded-full px-4 py-2 shadow-md text-sm text-[var(--foreground)] backdrop-blur-sm">
        Next questions in{' '}
        <span className="font-semibold tabular-nums">{formatDuration(msRemaining)}</span>
      </div>
    </div>
  );
}
