'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RankingEntry, GenreRankingEntry } from '@/lib/types';
import RankingOverall from '@/components/RankingOverall';
import RankingByGenre from '@/components/RankingByGenre';

export default function RankingPage() {
  const [showMode, setShowMode] = useState<'overall' | 'genre'>('overall');
  const [overallRanking, setOverallRanking] = useState<RankingEntry[]>([]);
  const [genreRankings, setGenreRankings] = useState<Record<string, GenreRankingEntry[]>>({});
  const [currentGenreIndex, setCurrentGenreIndex] = useState(0);
  const [genreNames, setGenreNames] = useState<string[]>([]);

  const fetchOverall = async () => {
    const { data } = await supabase
      .from('ranking_overall')
      .select('*')
      .limit(10);
    if (data) setOverallRanking(data);
  };

  const fetchGenre = async () => {
    const { data } = await supabase
      .from('ranking_by_genre')
      .select('*');
    if (data) {
      const grouped: Record<string, GenreRankingEntry[]> = {};
      data.forEach((entry: GenreRankingEntry) => {
        if (!grouped[entry.genre_name]) grouped[entry.genre_name] = [];
        if (grouped[entry.genre_name].length < 5) {
          grouped[entry.genre_name].push(entry);
        }
      });
      setGenreRankings(grouped);
      setGenreNames(Object.keys(grouped));
    }
  };

  useEffect(() => {
    fetchOverall();
    fetchGenre();

    // Realtime subscription
    const channel = supabase
      .channel('ranking-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
        fetchOverall();
        fetchGenre();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'answers' }, () => {
        fetchOverall();
        fetchGenre();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 自動切り替え: 15秒ごと
  useEffect(() => {
    const interval = setInterval(() => {
      setShowMode((prev) => {
        if (prev === 'overall') {
          return genreNames.length > 0 ? 'genre' : 'overall';
        } else {
          // ジャンルを1つ進める or 総合に戻る
          const nextIdx = currentGenreIndex + 1;
          if (nextIdx >= genreNames.length) {
            setCurrentGenreIndex(0);
            return 'overall';
          }
          setCurrentGenreIndex(nextIdx);
          return 'genre';
        }
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [genreNames, currentGenreIndex]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-5xl mx-auto">
        {showMode === 'overall' ? (
          <RankingOverall entries={overallRanking} />
        ) : (
          genreNames.length > 0 && (
            <RankingByGenre
              genreName={genreNames[currentGenreIndex]}
              entries={genreRankings[genreNames[currentGenreIndex]] || []}
            />
          )
        )}
      </div>
    </main>
  );
}
