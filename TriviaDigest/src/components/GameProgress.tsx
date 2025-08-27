type GameProgressProps = {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number[];
  scores: number[];
};

export default function GameProgress({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  scores
}: GameProgressProps) {
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  
  return (
    <div className="bg-[var(--background)] p-4 rounded-xl shadow-md w-full max-w-xl mx-auto border border-[var(--foreground)] mb-6">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium">Progress</span>
        <span className="text-sm font-medium">Score: {totalScore}</span>
      </div>
      
      <div className="flex gap-2">
        {Array.from({ length: totalQuestions }, (_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-full ${
              i < currentQuestion - 1
                ? 'bg-green-500'
                : i === currentQuestion - 1
                ? 'bg-blue-500'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-gray-600 mt-2">
        <span>Question {currentQuestion} of {totalQuestions}</span>
        <span>{answeredQuestions.length} answered</span>
      </div>
    </div>
  );
}