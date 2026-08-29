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
    case 1: return 'bg-gradient-to-r from-yellow-600/30 to-yellow-400/10 border-yellow-500/50';
    case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-300/5 border-gray-400/50';
    case 3: return 'bg-gradient-to-r from-orange-700/20 to-orange-500/5 border-orange-600/50';
    default: return 'bg-white/5 border-white/10';
  }
};

export default function RankingOverall({ entries }: Props) {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-5xl font-black text-center text-white mb-8">
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
              <p className="text-2xl font-bold text-white">{entry.nickname}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-yellow-300">{entry.total_score}<span className="text-lg text-white/50 ml-1">点</span></p>
              <p className="text-sm text-white/40">{(entry.total_time_ms / 1000).toFixed(1)}秒</p>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-white/50 text-xl py-12">まだ回答がありません</p>
        )}
      </div>
    </div>
  );
}