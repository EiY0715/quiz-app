'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Genre } from '@/lib/types';

export default function AdminGenres() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchGenres = async () => {
    const { data } = await supabase.from('genres').select('*').order('sort_order');
    if (data) setGenres(data);
  };

  useEffect(() => { fetchGenres(); }, []);

  const addGenre = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    await supabase.from('genres').insert({ name: newName.trim(), sort_order: genres.length });
    setNewName('');
    await fetchGenres();
    setLoading(false);
  };

  const deleteGenre = async (id: string) => {
    if (!confirm('このジャンルを削除しますか？関連する問題も削除されます。')) return;
    await supabase.from('genres').delete().eq('id', id);
    await fetchGenres();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📂 ジャンル管理</h2>

      {/* 新規作成 */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="新しいジャンル名"
          className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button onClick={addGenre} disabled={loading} className="btn-primary">
          追加
        </button>
      </div>

      {/* 一覧 */}
      <div className="space-y-2">
        {genres.map((genre) => (
          <div key={genre.id} className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200">
            <span className="text-gray-800 font-medium">{genre.name}</span>
            <button
              onClick={() => deleteGenre(genre.id)}
              className="text-red-500 hover:text-red-600 text-sm"
            >
              削除
            </button>
          </div>
        ))}
        {genres.length === 0 && (
          <p className="text-gray-400 text-center py-8">ジャンルがまだありません</p>
        )}
      </div>
    </div>
  );
}
