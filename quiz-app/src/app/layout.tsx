import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'クイズ大会 in 附属',
  description: '文化祭クイズ大会に参加しよう！',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-100 to-pink-100">
        {children}
      </body>
    </html>
  );
}
