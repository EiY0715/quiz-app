'use client';

interface Props {
  score: number;
  maxScore: number;
}

export default function QuizResult({ score, maxScore }: Props) {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return (
    <div className="card text-center">
      <div className="text-6xl mb-4">
        {percentage >= 80 ? '🏆' : percentage >= 50 ? '👏' : '💪'}
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">クイズ終了！</h2>
      <div className="my-6">
        <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-400">
          {score} <span className="text-2xl text-white/50">/ {maxScore}</span>
        </p>
        <p className="text-white/60 mt-2">正答率 {percentage}%</p>
      </div>
      <p className="text-white/70 text-sm">
        ランキングは会場モニターでチェック！
      </p>
    </div>
  );
}