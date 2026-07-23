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
  date: string;
  onAnswer: (selectedIndex: number, questionIndex: number) => void;
  isAnswered: boolean;
  userAnswer: number | null;
};

type AnswerState = 'idle' | 'checking' | 'correct' | 'incorrect';

// How long to flash the answer feedback before advancing to the next question.
const FEEDBACK_DELAY_MS = 700;

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  date,
  onAnswer,
  isAnswered,
  userAnswer,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);

  // Reset selected/feedback state when question changes
  useEffect(() => {
    setSelected(userAnswer);
    setAnswerState('idle');
    setCorrectIndex(null);
  }, [questionNumber, userAnswer]);

  const handleSelect = async (index: number) => {
    if (isAnswered || answerState !== 'idle') return;

    setSelected(index);
    setAnswerState('checking');

    const questionIndex = questionNumber - 1;

    try {
      const res = await fetch('/api/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, questionIndex, selectedIndex: index }),
      });

      if (!res.ok) throw new Error('check-answer request failed');

      const data = (await res.json()) as { correct: boolean; correctIndex: number };
      setAnswerState(data.correct ? 'correct' : 'incorrect');
      setCorrectIndex(data.correctIndex);
    } catch {
      // If the check fails, just advance without showing feedback.
      onAnswer(index, questionIndex);
      return;
    }

    setTimeout(() => {
      onAnswer(index, questionIndex);
    }, FEEDBACK_DELAY_MS);
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
            'p-3 border border-[var(--foreground)] rounded cursor-pointer transition-colors duration-200 hover:bg-[var(--highlight)] hover:bg-opacity-10 hover:text-black';

          if (answerState === 'correct' || answerState === 'incorrect') {
            if (i === selected) {
              optionClass += answerState === 'correct' ? ' bg-green-500 text-white' : ' bg-red-500 text-white';
            } else if (answerState === 'incorrect' && i === correctIndex) {
              optionClass += ' bg-green-500 text-white';
            }
          } else if (selected === i) {
            optionClass += ' bg-blue-500 text-white';
          }

          return (
            <li
              key={i}
              onClick={() => handleSelect(i)}
              className={`${optionClass} ${isAnswered || answerState !== 'idle' ? 'pointer-events-none' : ''}`}
            >
              {opt}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
