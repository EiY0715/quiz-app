'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  onStart: (participantId: string) => void;
}

export default function QuizStart({ onStart }: Props) {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }
    setLoading(true);
    setError('');

    const { data, error: dbError } = await supabase
      .from('participants')
      .insert({ nickname: nickname.trim() })
      .select()
      .single();

    if (dbError || !data) {
      setError('登録に失敗しました。もう一度お試しください。');
      setLoading(false);
      return;
    }

    onStart(data.id);
  };

  return (
    <div className="card text-center">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-800 mb-2">🎉 文化祭クイズ</h1>
        <p className="text-gray-500">ニックネームを入力してスタート！</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="ニックネーム"
          className="input-field text-center text-lg"
          maxLength={20}
          autoFocus
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-lg"
        >
          {loading ? '準備中...' : 'クイズをはじめる'}
        </button>
      </form>
    </div>
  );
}
