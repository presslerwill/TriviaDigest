'use client';
import { useEffect, useState } from 'react';
import LeaderboardTable from './LeaderboardTable';
import QuestionCard from './QuestionCard';
import GameProgress from './GameProgress';

type TriviaQuestion = {
  question: string;
  options: string[];
  correct_index: number;
};

export default function TriviaCard({ onScore }: { onScore: (score: number) => void }) {
  const [allQuestions, setAllQuestions] = useState<TriviaQuestion[] | null>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [questionResults, setQuestionResults] = useState<(boolean | null)[]>([]);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  useEffect(() => {
    // Check if user has played today
    const lastPlayed = localStorage.getItem('lastPlayedDate');
    const today = new Date().toDateString();
    
    if (lastPlayed === today) {
      setHasPlayedToday(true);
      return;
    }

    // If they haven't played today, fetch the questions
    fetch('/api/trivia')
      .then(res => res.json())
      .then((data: TriviaQuestion[]) => {
        setAllQuestions(data);
        // Initialize arrays for tracking answers and results
        setUserAnswers(new Array(data.length).fill(null));
        setQuestionResults(new Array(data.length).fill(null));
        setScores(new Array(data.length).fill(0));
      });
  }, []);

  const handleAnswer = (isCorrect: boolean, questionIndex: number) => {
    const newUserAnswers = [...userAnswers];
    const newQuestionResults = [...questionResults];
    const newScores = [...scores];
    
    newUserAnswers[questionIndex] = questionIndex; // Store the selected answer
    newQuestionResults[questionIndex] = isCorrect;
    newScores[questionIndex] = isCorrect ? 1000 : 0;
    
    setUserAnswers(newUserAnswers);
    setQuestionResults(newQuestionResults);
    setScores(newScores);
    
    // Move to next question or complete game
    if (currentQuestionIndex < (allQuestions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Game completed
      setGameCompleted(true);
      const totalScore = newScores.reduce((sum, score) => sum + score, 0);
      onScore(totalScore);
      
      // Save the play date
      localStorage.setItem('lastPlayedDate', new Date().toDateString());
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

  if (gameCompleted) {
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const correctAnswers = questionResults.filter(result => result === true).length;
    
    return (
      <>
        <div className="bg-[var(--background)] p-6 rounded-xl shadow-md w-full max-w-xl mx-auto border border-[var(--foreground)]">
          <h2 className="text-xl font-semibold mb-4">Game Complete!</h2>
          <p className="mb-2">Final Score: {totalScore} points</p>
          <p className="mb-4">You got {correctAnswers} out of {allQuestions.length} questions correct!</p>
          
          <div className="space-y-2">
            {allQuestions.map((question, index) => (
              <div key={index} className="p-3 border rounded">
                <p className="font-medium">Question {index + 1}: {question.question}</p>
                <p className={`text-sm ${questionResults[index] ? 'text-green-600' : 'text-red-600'}`}>
                  {questionResults[index] ? '✅ Correct' : '❌ Incorrect'}
                </p>
              </div>
            ))}
          </div>
        </div>
        <LeaderboardTable />
      </>
    );
  }

  const currentQuestion = allQuestions[currentQuestionIndex];

  return (
    <>
      <GameProgress
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={allQuestions.length}
        answeredQuestions={userAnswers.filter(answer => answer !== null)}
        scores={scores}
      />
      
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={allQuestions.length}
        onAnswer={handleAnswer}
        isAnswered={questionResults[currentQuestionIndex] !== null}
        userAnswer={userAnswers[currentQuestionIndex]}
        isCorrect={questionResults[currentQuestionIndex]}
      />
    </>
  );
}
