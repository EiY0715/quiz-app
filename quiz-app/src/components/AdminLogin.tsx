'use client';

import { useState } from 'react';

interface Props {
  onSuccess: () => void;
}

const ADMIN_PASSWORD = 'Yasaka0715';

export default function AdminLogin({ onSuccess }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true');
      onSuccess();
    } else {
      setError('パスワードが正しくありません');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-white mb-6">🔒 管理者ログイン</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            className="input-field text-center"
            autoFocus
          />
          {error && <p className="text-red-300 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            ログイン
          </button>
        </form>
      </div>
    </main>
  );
}