'use client';

import { RankingEntry } from '@/lib/types';

interface Props {
  entries: RankingEntry[];
}

const rankIcon = (rank: number) => {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return `${rank}`;
  }
};

const rankBg = (rank: number) => {
  switch (rank) {
    case 1: return 'bg-gradient-to-r from-yellow-200/60 to-yellow-100/30 border-yellow-400/60';
    case 2: return 'bg-gradient-to-r from-gray-200/60 to-gray-100/30 border-gray-400/60';
    case 3: return 'bg-gradient-to-r from-orange-200/60 to-orange-100/30 border-orange-400/60';
    default: return 'bg-white/70 border-white/80';
  }
};

export default function RankingOverall({ entries }: Props) {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-5xl font-black text-center text-gray-800 mb-8">
        🏆 総合ランキング
      </h1>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`flex items-center px-6 py-4 rounded-2xl border ${rankBg(entry.rank)} transition-all`}
          >
            <div className="text-4xl w-16 text-center">{rankIcon(entry.rank)}</div>
            <div className="flex-1 ml-4">
              <p className="text-2xl font-bold text-gray-800">{entry.nickname}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-yellow-500">{entry.total_score}<span className="text-lg text-gray-400 ml-1">点</span></p>
              <p className="text-sm text-gray-400">{(entry.total_time_ms / 1000).toFixed(1)}秒</p>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-gray-400 text-xl py-12">まだ回答がありません</p>
        )}
      </div>
    </div>
  );
}
