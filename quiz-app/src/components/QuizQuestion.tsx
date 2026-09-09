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

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QuizQuestion({ question, participantId, onAnswer }: Props) {
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(question.time_limit);
  const [startTime] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);

  const submitAnswer = useCallback(async (userAnswer: string) => {
    if (submitted) return;
    setSubmitted(true);
    setAnswer(userAnswer);

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

  const handleSelectChoice = (choice: string) => {
    if (submitted) return;
    submitAnswer(choice);
  };

  const timePercent = (timeLeft / question.time_limit) * 100;
  const timeColor = timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-yellow-500' : 'bg-green-500';

  const images = question.image_urls || [];
  const imageHeightClass = images.length === 1 ? 'h-40 sm:h-52' : 'h-24 sm:h-32';

  const choices = question.choices || [];

  return (
    <div className="card">
      {/* タイマーバー */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${timeColor}`}
          style={{ width: `${timePercent}%` }}
        />
      </div>
      <div className="text-right text-gray-500 text-xs sm:text-sm mb-4">
        残り <span className={`font-bold text-base sm:text-lg ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-800'}`}>{timeLeft}</span> 秒
      </div>

      {/* 問題画像（最大4枚） */}
      {images.length > 0 && (
        <div className={`mb-4 grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {images.map((url, i) => (
            <div
              key={i}
              className={`rounded-xl overflow-hidden bg-gray-100 ${
                images.length === 3 && i === 0 ? 'col-span-2' : ''
              }`}
            >
              <img
                src={url}
                alt={`問題画像${i + 1}`}
                className={`w-full ${imageHeightClass} object-cover`}
              />
            </div>
          ))}
        </div>
      )}

      {/* 問題文 */}
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 leading-relaxed">
        {question.question_text}
      </h2>

      {question.question_type === 'choice' ? (
        <div className="space-y-4">
          {/* 選択肢: 常に2列・同じサイズで統一配置 */}
          <div className="grid grid-cols-2 gap-3">
            {choices.map((opt, i) => {
              const isSelected = opt === answer;
              const isCorrectOpt = question.correct_answers.includes(opt);

              let stateClass = 'bg-white border-gray-300 text-gray-800 hover:border-primary-400 hover:bg-primary-50 active:scale-95';
              let badgeClass = 'bg-gray-100 text-gray-600';

              if (submitted) {
                if (isCorrectOpt) {
                  stateClass = 'bg-green-50 border-green-500 text-green-700';
                  badgeClass = 'bg-green-500 text-white';
                } else if (isSelected) {
                  stateClass = 'bg-red-50 border-red-500 text-red-700';
                  badgeClass = 'bg-red-500 text-white';
                } else {
                  stateClass = 'bg-gray-50 border-gray-200 text-gray-400';
                  badgeClass = 'bg-gray-100 text-gray-400';
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectChoice(opt)}
                  disabled={submitted}
                  className={`flex items-center gap-2 px-3 py-3 min-h-[64px] sm:min-h-[72px] rounded-xl border-2 text-left font-medium text-sm sm:text-base transition-all disabled:cursor-not-allowed ${stateClass}`}
                >
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${badgeClass}`}>
                    {OPTION_LABELS[i]}
                  </span>
                  <span className="flex-1 break-words leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>

          {submitted && (
            <div className="text-center py-2">
              <div className="text-xl sm:text-2xl">
                {question.correct_answers.includes(answer) ? '🎊 正解！' : '😢 不正解...'}
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="答えを入力"
            className="input-field text-center text-base sm:text-lg"
            disabled={submitted}
            autoFocus
            autoComplete="off"
          />
          {!submitted ? (
            <button type="submit" className="btn-primary w-full text-base sm:text-lg">
              回答する
            </button>
          ) : (
            <div className="text-center py-4">
              <div className="text-xl sm:text-2xl mb-2">
                {checkAnswer(answer, question.correct_answers) ? '🎊 正解！' : '😢 不正解...'}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">
                正解: {question.correct_answers[0]}
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
