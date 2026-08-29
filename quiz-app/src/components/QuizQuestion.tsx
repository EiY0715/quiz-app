'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { checkAnswer } from '@/lib/normalize';
import { Question } from '@/lib/types';

interface Props {
  question: Question;
  participantId: string;
  onAnswer: (score: number, timeMs: number) => void;
}

export default function QuizQuestion({ question, participantId, onAnswer }: Props) {
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(question.time_limit);
  const [startTime] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);

  const submitAnswer = useCallback(async (userAnswer: string) => {
    if (submitted) return;
    setSubmitted(true);

    const timeMs = Date.now() - startTime;
    const isCorrect = checkAnswer(userAnswer, question.correct_answers);
    const scoreAwarded = isCorrect ? question.points : 0;

    await supabase.from('answers').insert({
      participant_id: participantId,
      question_id: question.id,
      answer_text: userAnswer,
      is_correct: isCorrect,
      time_ms: timeMs,
      score_awarded: scoreAwarded,
    });

    // 正解/不正解のフィードバックを少し表示
    setTimeout(() => {
      onAnswer(scoreAwarded, timeMs);
    }, 1500);
  }, [submitted, startTime, question, participantId, onAnswer]);

  useEffect(() => {
    if (timeLeft <= 0) {
      submitAnswer(answer);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, answer, submitAnswer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAnswer(answer);
  };

  const timePercent = (timeLeft / question.time_limit) * 100;
  const timeColor = timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="card">
      {/* タイマーバー */}
      <div className="w-full bg-white/10 rounded-full h-3 mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${timeColor}`}
          style={{ width: `${timePercent}%` }}
        />
      </div>
      <div className="text-right text-white/70 text-sm mb-4">
        残り <span className={`font-bold text-lg ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>{timeLeft}</span> 秒
      </div>

      {/* 問題画像 */}
      {question.image_url && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <img
            src={question.image_url}
            alt="問題画像"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* 問題文 */}
      <h2 className="text-xl font-bold text-white mb-6 leading-relaxed">
        {question.question_text}
      </h2>

      {/* 回答入力 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="答えを入力"
          className="input-field text-center text-lg"
          disabled={submitted}
          autoFocus
          autoComplete="off"
        />
        {!submitted ? (
          <button type="submit" className="btn-primary w-full text-lg">
            回答する
          </button>
        ) : (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">
              {checkAnswer(answer, question.correct_answers) ? '🎊 正解！' : '😢 不正解...'}
            </div>
            <p className="text-white/60 text-sm">
              正解: {question.correct_answers[0]}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}