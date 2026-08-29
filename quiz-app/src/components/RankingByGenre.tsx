'use client';

import { GenreRankingEntry } from '@/lib/types';

interface Props {
  genreName: string;
  entries: GenreRankingEntry[];
}

const rankIcon = (rank: number) => {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return `${rank}`;
  }
};

export default function RankingByGenre({ genreName, entries }: Props) {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-black text-center text-white mb-2">
        📚 ジャンル別ランキング
      </h1>
      <h2 className="text-3xl font-bold text-center text-purple-300 mb-8">{genreName}</h2>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.participant_id}
            className="flex items-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10"
          >
            <div className="text-3xl w-14 text-center">{rankIcon(entry.rank)}</div>
            <div className="flex-1 ml-4">
              <p className="text-xl font-bold text-white">{entry.nickname}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-green-300">{entry.genre_score}<span className="text-base text-white/50 ml-1">点</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}