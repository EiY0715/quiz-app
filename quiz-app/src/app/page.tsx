'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Question } from '@/lib/types';
import QuizStart from '@/components/QuizStart';
import QuizDifficulty from '@/components/QuizDifficulty';
import QuizQuestion from '@/components/QuizQuestion';
import QuizResult from '@/components/QuizResult';

type Phase = 'start' | 'difficulty' | 'question' | 'result';

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>('start');
  const [participantId, setParticipantId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) {
      setQuestions(data);
      setMaxScore(data.reduce((sum: number, q: Question) => sum + q.points, 0));
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleStart = (id: string) => {
    setParticipantId(id);
    setPhase('difficulty');
  };

  const handleDifficultyDone = () => {
    setPhase('question');
  };

  const handleAnswer = async (score: number, timeMs: number) => {
    setTotalScore((prev) => prev + score);
    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      setPhase('difficulty');
    } else {
      // 合計スコアと時間を更新
      const { data: answers } = await supabase
        .from('answers')
        .select('score_awarded, time_ms')
        .eq('participant_id', participantId);
      
      const finalScore = answers?.reduce((s, a) => s + a.score_awarded, 0) || 0;
      const finalTime = answers?.reduce((t, a) => t + a.time_ms, 0) || 0;

      await supabase
        .from('participants')
        .update({ total_score: finalScore, total_time_ms: finalTime })
        .eq('id', participantId);

      setTotalScore(finalScore);
      setPhase('result');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {phase === 'start' && (
          <QuizStart onStart={handleStart} />
        )}
        {phase === 'difficulty' && questions[currentIndex] && (
          <QuizDifficulty
            difficulty={questions[currentIndex].difficulty}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            onDone={handleDifficultyDone}
          />
        )}
        {phase === 'question' && questions[currentIndex] && (
          <QuizQuestion
            question={questions[currentIndex]}
            participantId={participantId}
            onAnswer={handleAnswer}
          />
        )}
        {phase === 'result' && (
          <QuizResult score={totalScore} maxScore={maxScore} />
        )}
      </div>
    </main>
  );
}