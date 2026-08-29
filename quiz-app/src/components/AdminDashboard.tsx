'use client';

import { useState } from 'react';
import AdminGenres from '@/components/AdminGenres';
import AdminQuestions from '@/components/AdminQuestions';
import AdminReset from '@/components/AdminReset';

type Tab = 'genres' | 'questions' | 'reset';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('questions');

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'genres', label: 'ジャンル管理', icon: '📂' },
    { key: 'questions', label: '問題管理', icon: '❓' },
    { key: 'reset', label: 'データリセット', icon: '🗑️' },
  ];

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="flex">
        {/* サイドバー */}
        <aside className="w-64 min-h-screen bg-gray-800 border-r border-gray-700 p-4">
          <h1 className="text-xl font-bold text-white mb-6 px-2">⚙️ 管理パネル</h1>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <div className="flex-1 p-8">
          {activeTab === 'genres' && <AdminGenres />}
          {activeTab === 'questions' && <AdminQuestions />}
          {activeTab === 'reset' && <AdminReset />}
        </div>
      </div>
    </main>
  );
}