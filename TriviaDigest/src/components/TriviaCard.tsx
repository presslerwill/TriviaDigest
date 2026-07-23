'use client';
import { useEffect, useState } from 'react';
import LeaderboardTable from './LeaderboardTable';
import QuestionCard from './QuestionCard';
import GameProgress from './GameProgress';

type TriviaQuestion = {
  question: string;
  options: string[];
};

type TriviaCardProps = {
  onComplete: (answers: (number | null)[], date: string) => void;
  onReady?: () => void;
};

export default function TriviaCard({ onComplete, onReady }: TriviaCardProps) {
  const [allQuestions, setAllQuestions] = useState<TriviaQuestion[] | null>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [gameDate, setGameDate] = useState('');

  useEffect(() => {
    const utcToday = new Date().toISOString().split('T')[0];

    const lastPlayed = localStorage.getItem('lastPlayedDate');
    if (lastPlayed === utcToday) {
      setHasPlayedToday(true);
      return;
    }

    setGameDate(utcToday);

    fetch(`/api/trivia`)
      .then(res => res.json())
      .then((data: TriviaQuestion[]) => {
        setAllQuestions(data);
        setUserAnswers(new Array(data.length).fill(null));
        onReady?.();
      });
  }, []);

  const handleAnswer = (selectedIndex: number, questionIndex: number) => {
    const newUserAnswers = [...userAnswers];
    newUserAnswers[questionIndex] = selectedIndex;
    setUserAnswers(newUserAnswers);

    // Move to next question or finish. Scoring is done server-side on submit,
    // so we just collect the picked options here.
    if (currentQuestionIndex < (allQuestions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      localStorage.setItem('lastPlayedDate', new Date().toISOString().split('T')[0]);
      onComplete(newUserAnswers, gameDate);
    }
  };

  if (hasPlayedToday) {
    return (
      <>
        <div className="bg-[var(--background)] p-6 rounded-xl shadow-md w-full max-w-xl mx-auto border border-[var(--foreground)]">
          <h2 className="text-xl font-semibold mb-4">Come back tomorrow!</h2>
          <p>You&apos;ve already played today&apos;s trivia. Check back tomorrow for a new question!</p>
        </div>
        <LeaderboardTable />
      </>
    );
  }

  if (!allQuestions || allQuestions.length === 0) {
    return <p className="text-center">Loading...</p>;
  }

  const currentQuestion = allQuestions[currentQuestionIndex];

  return (
    <>
      <GameProgress
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={allQuestions.length}
        answeredQuestions={userAnswers.filter((answer) => answer !== null) as number[]}
      />

      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={allQuestions.length}
        date={gameDate}
        onAnswer={handleAnswer}
        isAnswered={userAnswers[currentQuestionIndex] !== null}
        userAnswer={userAnswers[currentQuestionIndex]}
      />
    </>
  );
}
