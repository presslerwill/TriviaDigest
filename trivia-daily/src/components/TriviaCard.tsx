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

  useEffect(() => {
    fetch('/api/trivia')
      .then(res => res.json())
      .then(data => setQuestion(data));
  }, []);

  const handleSelect = (index: number) => {
    if (selected !== null) return; // Prevent multiple answers
    setSelected(index);
    const correct = question?.correct_index === index;
    setIsCorrect(correct);
    onScore(correct ? 1 : 0);
  };

  if (!question) return <p>Loading...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">{question.question}</h2>
      <ul className="space-y-2">
        {question.options.map((opt, i) => (
          <li
            key={i}
            onClick={() => handleSelect(i)}
            className={`p-3 border rounded cursor-pointer ${
              selected === i
                ? i === question.correct_index
                  ? 'bg-green-200'
                  : 'bg-red-200'
                : 'hover:bg-gray-100'
            }`}
          >
            {opt}
          </li>
        ))}
      </ul>
      {selected !== null && (
        <p className="mt-4 text-lg font-medium">
          {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
        </p>
      )}
    </div>
  );
}
