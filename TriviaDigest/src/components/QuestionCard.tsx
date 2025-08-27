'use client';
import { useState, useEffect } from 'react';

type TriviaQuestion = {
  question: string;
  options: string[];
  correct_index: number;
};

type QuestionCardProps = {
  question: TriviaQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean, questionIndex: number) => void;
  isAnswered: boolean;
  userAnswer: number | null;
  isCorrect: boolean | null;
};

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  isAnswered,
  userAnswer,
  isCorrect
}: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  // Reset selected state when question changes
  useEffect(() => {
    setSelected(userAnswer);
  }, [questionNumber, userAnswer]);

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelected(index);
    const correct = question.correct_index === index;
    onAnswer(correct, questionNumber - 1);
  };

  return (
    <div className="bg-[var(--background)] p-6 rounded-xl shadow-md w-full max-w-xl mx-auto border border-[var(--foreground)] mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Question {questionNumber} of {totalQuestions}</h2>
        {isAnswered && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isCorrect ? 'Correct' : 'Incorrect'}
          </span>
        )}
      </div>
      
      <h3 className="text-lg mb-4">{question.question}</h3>
      
      <ul className="space-y-2">
        {question.options.map((opt, i) => {
          let highlightClass = 'hover:bg-[var(--highlight)] hover:bg-opacity-10 hover:text-black';

          if (selected === i && (highlightClass.includes('bg-white') || highlightClass.includes('bg-[var(--foreground)] hover:bg-opacity-10'))) {
            highlightClass += ' text-black';
          }

          let optionClass = `p-3 border border-[var(--foreground)] rounded cursor-pointer ${highlightClass}`;
          
          if (isAnswered) {
            if (i === question.correct_index) {
              optionClass += ' bg-green-700 text-white';
            } else if (selected === i && i !== question.correct_index) {
              optionClass += ' bg-red-700 text-white';
            } else {
              optionClass += ' opacity-60';
            }
          } else if (selected === i) {
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
      
      {isAnswered && (
        <p className="mt-4 text-lg font-medium">
          {isCorrect ? '✅ Correct! +1000 points' : '❌ Incorrect +0 points'}
        </p>
      )}
    </div>
  );
} 