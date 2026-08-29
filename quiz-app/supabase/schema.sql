-- ===================================
-- 文化祭クイズアプリ: データベーススキーマ
-- ===================================

-- ジャンルテーブル
CREATE TABLE genres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 問題テーブル
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  image_url TEXT,
  correct_answers TEXT[] NOT NULL DEFAULT '{}',
  difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  points INT NOT NULL DEFAULT 10,
  time_limit INT NOT NULL DEFAULT 30 CHECK (time_limit BETWEEN 20 AND 100),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 参加者テーブル
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL,
  total_score INT DEFAULT 0,
  total_time_ms BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 回答テーブル
CREATE TABLE answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  time_ms BIGINT DEFAULT 0,
  score_awarded INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_answers_participant ON answers(participant_id);
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_questions_genre ON questions(genre_id);
CREATE INDEX idx_participants_score ON participants(total_score DESC, total_time_ms ASC);

-- Realtimeを有効にする
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;

-- ランキング用ビュー（総合）
CREATE OR REPLACE VIEW ranking_overall AS
SELECT
  p.id,
  p.nickname,
  p.total_score,
  p.total_time_ms,
  RANK() OVER (ORDER BY p.total_score DESC, p.total_time_ms ASC) AS rank
FROM participants p
WHERE p.total_score > 0
ORDER BY rank ASC;

-- ランキング用ビュー（ジャンル別）
CREATE OR REPLACE VIEW ranking_by_genre AS
SELECT
  p.id AS participant_id,
  p.nickname,
  g.id AS genre_id,
  g.name AS genre_name,
  COALESCE(SUM(a.score_awarded), 0) AS genre_score,
  COALESCE(SUM(a.time_ms), 0) AS genre_time_ms,
  RANK() OVER (
    PARTITION BY g.id
    ORDER BY COALESCE(SUM(a.score_awarded), 0) DESC,
             COALESCE(SUM(a.time_ms), 0) ASC
  ) AS rank
FROM participants p
JOIN answers a ON a.participant_id = p.id
JOIN questions q ON q.id = a.question_id
JOIN genres g ON g.id = q.genre_id
WHERE a.is_correct = TRUE
GROUP BY p.id, p.nickname, g.id, g.name
ORDER BY g.name, rank;

-- Storageバケット作成（Supabase Dashboard or CLI で実行）
-- INSERT INTO storage.buckets (id, name, public) VALUES ('question-images', 'question-images', true);

-- RLS（Row Level Security）ポリシー
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- 参加者は読み取り可能、書き込みも可能（anonキーでのアクセス）
CREATE POLICY "全員読み取り可能" ON genres FOR SELECT USING (true);
CREATE POLICY "全員読み取り可能" ON questions FOR SELECT USING (true);
CREATE POLICY "全員読み取り可能" ON participants FOR SELECT USING (true);
CREATE POLICY "全員読み取り可能" ON answers FOR SELECT USING (true);

CREATE POLICY "参加者作成可能" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "参加者更新可能" ON participants FOR UPDATE USING (true);
CREATE POLICY "回答作成可能" ON answers FOR INSERT WITH CHECK (true);

-- 管理者操作用（service_roleキーをAPI Routeで使う場合は不要だが安全策として）
CREATE POLICY "管理者全操作" ON genres FOR ALL USING (true);
CREATE POLICY "管理者全操作" ON questions FOR ALL USING (true);
CREATE POLICY "管理者削除可能" ON participants FOR DELETE USING (true);
CREATE POLICY "管理者削除可能" ON answers FOR DELETE USING (true);