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
};

export default function TriviaCard({ onComplete }: TriviaCardProps) {
  const [allQuestions, setAllQuestions] = useState<TriviaQuestion[] | null>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [gameDate, setGameDate] = useState('');

  useEffect(() => {
    // Check if user has played today
    const lastPlayed = localStorage.getItem('lastPlayedDate');
    const today = new Date().toDateString();

    if (lastPlayed === today) {
      setHasPlayedToday(true);
      return;
    }

    // Send the user's own local calendar date so they get "today's" trivia the
    // moment their local clock crosses midnight, regardless of timezone.
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setGameDate(localDate);

    // If they haven't played today, fetch the questions (without answers).
    fetch(`/api/trivia?date=${localDate}`)
      .then(res => res.json())
      .then((data: TriviaQuestion[]) => {
        setAllQuestions(data);
        setUserAnswers(new Array(data.length).fill(null));
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
      localStorage.setItem('lastPlayedDate', new Date().toDateString());
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
        onAnswer={handleAnswer}
        isAnswered={userAnswers[currentQuestionIndex] !== null}
        userAnswer={userAnswers[currentQuestionIndex]}
      />
    </>
  );
}
