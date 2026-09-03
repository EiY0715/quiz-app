'use client';

import { useEffect } from 'react';

interface Props {
  difficulty: number;
  questionNumber: number;
  totalQuestions: number;
  onDone: () => void;
}

export default function QuizDifficulty({ difficulty, questionNumber, totalQuestions, onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000); // 3秒表示
    return () => clearTimeout(timer);
  }, [onDone]);

  const stars = '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);

  return (
    <div className="card text-center animate-pulse">
      <p className="text-gray-500 text-xs sm:text-sm mb-2">
        第 {questionNumber} 問 / {totalQuestions} 問
      </p>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">難易度</h2>
      <div className="text-3xl sm:text-4xl text-yellow-500 mb-4">{stars}</div>
      <p className="text-gray-400 text-xs sm:text-sm">まもなく出題されます...</p>
    </div>
  );
}
