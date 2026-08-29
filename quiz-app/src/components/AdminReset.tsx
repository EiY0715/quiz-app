'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminReset() {
  const [resetting, setResetting] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (!confirm('本当にすべての回答データとランキングをリセットしますか？\nこの操作は取り消せません。')) return;
    if (!confirm('最終確認: 全参加者データが完全に削除されます。本当に実行しますか？')) return;

    setResetting(true);
    // answers → participants の順に削除（外部キー制約）
    await supabase.from('answers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    setResetting(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">🗑️ データリセット</h2>
      <div className="bg-gray-800 rounded-2xl border border-red-900/50 p-6">
        <p className="text-gray-300 mb-4">
          蓄積された回答データ（参加者の回答、スコア、ランキング）をすべて初期化します。<br />
          問題データやジャンル設定は保持されます。
        </p>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all disabled:opacity-50"
        >
          {resetting ? 'リセット中...' : '⚠️ 回答データを全削除'}
        </button>
        {done && <p className="text-green-400 mt-4">✅ リセット完了しました</p>}
      </div>
    </div>
  );
}