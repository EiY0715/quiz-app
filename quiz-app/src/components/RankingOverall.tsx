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

const rankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        row: 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-400 shadow-lg shadow-yellow-200/50 sm:scale-[1.02]',
        badge: 'bg-yellow-400 text-white',
      };
    case 2:
      return {
        row: 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-400 shadow-md',
        badge: 'bg-gray-400 text-white',
      };
    case 3:
      return {
        row: 'bg-gradient-to-r from-orange-100 to-orange-50 border-orange-400 shadow-md',
        badge: 'bg-orange-400 text-white',
      };
    default:
      return {
        row: 'bg-white/70 border-white/80',
        badge: 'bg-gray-200 text-gray-600',
      };
  }
};

export default function RankingOverall({ entries }: Props) {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl sm:text-5xl font-black text-center text-gray-800 mb-6 sm:mb-8 tracking-tight">
        🏆 総合ランキング
      </h1>
      <div className="space-y-2 sm:space-y-3">
        {entries.map((entry) => {
          const style = rankStyle(entry.rank);
          return (
            <div
              key={entry.id}
              className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border transition-all duration-300 ${style.row}`}
            >
              <div className={`flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full text-lg sm:text-2xl font-black shrink-0 ${style.badge}`}>
                {rankIcon(entry.rank)}
              </div>
              <div className="flex-1 min-w-0 ml-3 sm:ml-4">
                <p className="text-lg sm:text-2xl font-bold text-gray-800 truncate">{entry.nickname}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl sm:text-3xl font-black text-yellow-500">
                  {entry.total_score}<span className="text-sm sm:text-lg text-gray-400 ml-1">点</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-400">{(entry.total_time_ms / 1000).toFixed(1)}秒</p>
              </div>
            </div>
          );
        })}
        {entries.length === 0 && (
          <p className="text-center text-gray-400 text-lg sm:text-xl py-12">まだ回答がありません</p>
        )}
      </div>
    </div>
  );
}
