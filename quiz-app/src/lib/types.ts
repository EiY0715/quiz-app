export interface Genre {
  id: string;
  name: string;
  sort_order: number;
}

export interface Question {
  id: string;
  genre_id: string;
  question_text: string;
  image_url: string | null;
  correct_answers: string[];
  difficulty: number;
  points: number;
  time_limit: number;
  sort_order: number;
}

export interface Participant {
  id: string;
  nickname: string;
  total_score: number;
  total_time_ms: number;
  created_at: string;
}

export interface Answer {
  id: string;
  participant_id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  time_ms: number;
  score_awarded: number;
}

export interface RankingEntry {
  id: string;
  nickname: string;
  total_score: number;
  total_time_ms: number;
  rank: number;
}

export interface GenreRankingEntry {
  participant_id: string;
  nickname: string;
  genre_id: string;
  genre_name: string;
  genre_score: number;
  genre_time_ms: number;
  rank: number;
}