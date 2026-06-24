'use client';
import { useState, useEffect } from 'react';

type TriviaQuestion = {
  question: string;
  options: string[];
};

type QuestionCardProps = {
  question: TriviaQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedIndex: number, questionIndex: number) => void;
  isAnswered: boolean;
  userAnswer: number | null;
};

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  isAnswered,
  userAnswer,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  // Reset selected state when question changes
  useEffect(() => {
    setSelected(userAnswer);
  }, [questionNumber, userAnswer]);

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelected(index);
    // Report only which option was picked. Correctness is decided server-side.
    onAnswer(index, questionNumber - 1);
  };

  return (
    <div className="bg-[var(--background)] p-6 rounded-xl shadow-md w-full max-w-xl mx-auto border border-[var(--foreground)] mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Question {questionNumber} of {totalQuestions}</h2>
      </div>

      <h3 className="text-lg mb-4">{question.question}</h3>

      <ul className="space-y-2">
        {question.options.map((opt, i) => {
          let optionClass =
            'p-3 border border-[var(--foreground)] rounded cursor-pointer hover:bg-[var(--highlight)] hover:bg-opacity-10 hover:text-black';

          if (selected === i) {
            optionClass += ' bg-blue-500 text-white';
          }

          return (
            <li
              key={i}
              onClick={() => handleSelect(i)}
              className={`${optionClass} ${isAnswered ? 'pointer-events-none' : ''}`}
            >
              {opt}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
