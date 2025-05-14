'use client';
import { useEffect, useState } from 'react';

type TriviaQuestion = {
  question: string;
  options: string[];
  correct_index: number;
};

export default function TriviaCard({ onScore }: { onScore: (score: number) => void }) {
  const [question, setQuestion] = useState<TriviaQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    fetch('/api/trivia')
      .then(res => res.json())
      .then(data => setQuestion(data));
  }, []);

  const handleSelect = (index: number) => {
    if (selected !== null || skipped) return; // Prevent multiple answers or skip
    setSelected(index);
    const correct = question?.correct_index === index;
    setIsCorrect(correct);
    onScore(correct ? 1000 : 0);
  };

  const handleSkip = () => {
    if (selected !== null || skipped) return;
    setSkipped(true);
    onScore(500);
  };

  if (!question) return <p className="text-center">Loading...</p>;

  return (
    <div className="bg-[var(--background)] p-6 rounded-xl shadow-md w-full max-w-xl mx-auto border border-[var(--foreground)]">
      <h2 className="text-xl font-semibold mb-4">{question.question}</h2>
      <ul className="space-y-2">
        {question.options.map((opt, i) => {
          let highlightClass = 'hover:bg-[var(--highlight)] hover:bg-opacity-10 hover:text-black';

          // If the highlight is a very light background, force text-black
          if (
            (selected === i && (highlightClass.includes('bg-white') || highlightClass.includes('bg-[var(--foreground)] hover:bg-opacity-10')))
          ) {
            highlightClass += ' text-black';
          }

          return (
            <li
              key={i}
              onClick={() => handleSelect(i)}
              className={`p-3 border border-[var(--foreground)] rounded cursor-pointer ${highlightClass} ${selected === i ? (i === question.correct_index ? 'bg-green-700 text-white' : 'bg-red-700 text-white') : ''} ${selected !== null || skipped ? 'pointer-events-none opacity-60' : ''}`}
            >
              {opt}
            </li>
          );
        })}
      </ul>
      <button
        onClick={handleSkip}
        className="mt-4 px-4 py-2 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-300 disabled:opacity-50"
        disabled={selected !== null || skipped}
      >
        Skip (500 pts)
      </button>
      {(selected !== null || skipped) && (
        <p className="mt-4 text-lg font-medium">
          {skipped
            ? '⏭️ Skipped! +500 points'
            : isCorrect
            ? '✅ Correct! +1000 points'
            : '❌ Incorrect +0 points'}
        </p>
      )}
    </div>
  );
}
