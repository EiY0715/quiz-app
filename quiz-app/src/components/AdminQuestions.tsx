'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Genre, Question, QuestionType } from '@/lib/types';

type ImageSlot = File | string | null;

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface QuestionRecord {
  genre_id: string;
  question_text: string;
  image_urls: string[];
  question_type: QuestionType;
  choices: string[];
  correct_answers: string[];
  difficulty: number;
  points: number;
  time_limit: number;
  sort_order?: number;
}

export default function AdminQuestions() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formGenre, setFormGenre] = useState('');
  const [formText, setFormText] = useState('');
  const [formQuestionType, setFormQuestionType] = useState<QuestionType>('text');
  const [formAnswers, setFormAnswers] = useState('');
  const [formChoices, setFormChoices] = useState<string[]>(['', '']);
  const [formCorrectChoiceIndex, setFormCorrectChoiceIndex] = useState<number | null>(null);
  const [formDifficulty, setFormDifficulty] = useState(3);
  const [formPoints, setFormPoints] = useState(10);
  const [formTimeLimit, setFormTimeLimit] = useState(30);
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([null, null, null, null]);
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([null, null, null, null]);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const { data: g } = await supabase.from('genres').select('*').order('sort_order');
    const { data: q } = await supabase.from('questions').select('*').order('sort_order');
    if (g) setGenres(g);
    if (q) setQuestions(q);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const urls = imageSlots.map((slot) => {
      if (slot instanceof File) return URL.createObjectURL(slot);
      if (typeof slot === 'string') return slot;
      return null;
    });
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url, i) => {
        if (imageSlots[i] instanceof File && url) URL.revokeObjectURL(url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSlots]);

  const updateSlot = (index: number, value: ImageSlot) => {
    setImageSlots((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const resetForm = () => {
    setFormGenre('');
    setFormText('');
    setFormQuestionType('text');
    setFormAnswers('');
    setFormChoices(['', '']);
    setFormCorrectChoiceIndex(null);
    setFormDifficulty(3);
    setFormPoints(10);
    setFormTimeLimit(30);
    setImageSlots([null, null, null, null]);
    setEditingId(null);
    setShowForm(false);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('question-images')
      .upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage
      .from('question-images')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const addChoice = () => {
    setFormChoices((prev) => (prev.length < 6 ? [...prev, ''] : prev));
  };

  const removeChoice = (index: number) => {
    setFormChoices((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setFormCorrectChoiceIndex((prev) => {
      if (prev === null) return prev;
      if (prev === index) return null;
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  const updateChoiceText = (index: number, value: string) => {
    setFormChoices((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSave = async () => {
    if (!formGenre || !formText.trim()) {
      alert('ジャンルと問題文は必須です');
      return;
    }

    let correctAnswers: string[] = [];
    let choicesToSave: string[] = [];

    if (formQuestionType === 'text') {
      if (!formAnswers.trim()) {
        alert('正解を入力してください');
        return;
      }
      correctAnswers = formAnswers.split(',').map((a) => a.trim()).filter(Boolean);
    } else {
      if (formAnswers.trim()) {
        alert('選択式が選ばれていますが、記述式の正解欄に文字が残っています。記述式の入力欄を空にしてから保存してください。');
        return;
      }
      const trimmedChoices = formChoices.map((c) => c.trim());
      if (trimmedChoices.some((c) => !c)) {
        alert('すべての選択肢を入力してください');
        return;
      }
      if (trimmedChoices.length < 2) {
        alert('選択肢は2つ以上入力してください');
        return;
      }
      if (formCorrectChoiceIndex === null || !trimmedChoices[formCorrectChoiceIndex]) {
        alert('正解の選択肢を選んでください');
        return;
      }
      choicesToSave = trimmedChoices;
      correctAnswers = [trimmedChoices[formCorrectChoiceIndex]];
    }

    setSaving(true);

    const imageUrls: string[] = [];
    for (const slot of imageSlots) {
      if (slot instanceof File) {
        const url = await uploadImage(slot);
        imageUrls.push(url);
      } else if (typeof slot === 'string') {
        imageUrls.push(slot);
      }
    }

    const record: QuestionRecord = {
      genre_id: formGenre,
      question_text: formText,
      image_urls: imageUrls,
      question_type: formQuestionType,
      choices: choicesToSave,
      correct_answers: correctAnswers,
      difficulty: formDifficulty,
      points: formPoints,
      time_limit: formTimeLimit,
      sort_order: editingId ? undefined : questions.length,
    };

    if (editingId) {
      await supabase.from('questions').update(record).eq('id', editingId);
    } else {
      await supabase.from('questions').insert(record);
    }

    await fetchData();
    resetForm();
    setSaving(false);
  };

  const editQuestion = (q: Question) => {
    setEditingId(q.id);
    setFormGenre(q.genre_id);
    setFormText(q.question_text);
    setFormDifficulty(q.difficulty);
    setFormPoints(q.points);
    setFormTimeLimit(q.time_limit);

    const slots: ImageSlot[] = [null, null, null, null];
    (q.image_urls || []).slice(0, 4).forEach((url, i) => { slots[i] = url; });
    setImageSlots(slots);

    setFormQuestionType(q.question_type || 'text');
    if (q.question_type === 'choice') {
      const loadedChoices = q.choices && q.choices.length >= 2 ? q.choices : ['', ''];
      setFormChoices(loadedChoices);
      const correctIdx = loadedChoices.findIndex((c) => q.correct_answers.includes(c));
      setFormCorrectChoiceIndex(correctIdx >= 0 ? correctIdx : null);
      setFormAnswers('');
    } else {
      setFormChoices(['', '']);
      setFormCorrectChoiceIndex(null);
      setFormAnswers(q.correct_answers.join(', '));
    }

    setShowForm(true);
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('この問題を削除しますか？')) return;
    await supabase.from('questions').delete().eq('id', id);
    await fetchData();
  };

  const moveQuestion = async (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newQuestions.length) return;

    const tempOrder = newQuestions[index].sort_order;
    await supabase.from('questions').update({ sort_order: newQuestions[swapIdx].sort_order }).eq('id', newQuestions[index].id);
    await supabase.from('questions').update({ sort_order: tempOrder }).eq('id', newQuestions[swapIdx].id);
    await fetchData();
  };

  const activePreviewCount = previewUrls.filter(Boolean).length;
  const isText = formQuestionType === 'text';
  const isChoice = formQuestionType === 'choice';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">❓ 問題管理</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
          ＋ 新規作成
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800">
            {editingId ? '問題を編集' : '新しい問題を作成'}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 block mb-1">ジャンル</label>
              <select
                value={formGenre}
                onChange={(e) => setFormGenre(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800"
              >
                <option value="">選択してください</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">難易度 (1〜5)</label>
              <input
                type="number" min={1} max={5}
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-1">問題文</label>
            <textarea
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-1">回答形式</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormQuestionType('text')}
                className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  isText ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                ✏️ 記述式
              </button>
              <button
                type="button"
                onClick={() => setFormQuestionType('choice')}
                className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  isChoice ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                ☑️ 選択式
              </button>
            </div>
          </div>

          <div className={isChoice ? 'opacity-40' : ''}>
            <label className="text-sm text-gray-500 block mb-1">
              正解（カンマ区切りで複数可）{isChoice && '（選択式のため入力不可）'}
            </label>
            <input
              type="text"
              value={formAnswers}
              onChange={(e) => setFormAnswers(e.target.value)}
              placeholder="例: 徳川家康, とくがわいえやす"
              disabled={isChoice}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          <div className={isText ? 'opacity-40' : ''}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-gray-500">
                選択肢（2〜6個・左のラジオボタンで正解を指定）{isText && '（記述式のため入力不可）'}
              </label>
              <button
                type="button"
                onClick={addChoice}
                disabled={isText || formChoices.length >= 6}
                className="text-xs text-primary-600 hover:text-primary-700 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                ＋ 選択肢を追加
              </button>
            </div>
            <div className="space-y-2">
              {formChoices.map((choice, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctChoice"
                    checked={formCorrectChoiceIndex === i}
                    onChange={() => setFormCorrectChoiceIndex(i)}
                    disabled={isText}
                    className="w-4 h-4 accent-primary-600 disabled:cursor-not-allowed shrink-0"
                  />
                  <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{OPTION_LABELS[i]}</span>
                  <input
                    type="text"
                    value={choice}
                    onChange={(e) => updateChoiceText(i, e.target.value)}
                    disabled={isText}
                    placeholder={`選択肢${OPTION_LABELS[i]}`}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 text-sm disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeChoice(i)}
                    disabled={isText || formChoices.length <= 2}
                    className="text-red-400 hover:text-red-600 text-xs disabled:text-gray-300 disabled:cursor-not-allowed shrink-0"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 block mb-1">配点</label>
              <input
                type="number" min={1}
                value={formPoints}
                onChange={(e) => setFormPoints(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">制限時間（秒: 10〜200）</label>
              <input
                type="number" min={10} max={200}
                value={formTimeLimit}
                onChange={(e) => setFormTimeLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-2">画像（最大4枚・任意）</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imageSlots.map((slot, i) => (
                <div key={i} className="relative">
                  {previewUrls[i] ? (
                    <div className="relative rounded-lg overflow-hidden border border-gray-300 aspect-square">
                      <img src={previewUrls[i] as string} alt={`画像${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => updateSlot(i, null)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 text-gray-400 text-xs cursor-pointer hover:border-primary-400 hover:text-primary-500 transition-colors">
                      ＋ 追加
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) updateSlot(i, file);
                        }}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {activePreviewCount > 0 && (
            <div>
              <label className="text-sm text-gray-500 block mb-2">📱 スマホでの表示プレビュー</label>
              <div className="mx-auto w-[260px] rounded-[2rem] border-8 border-gray-800 bg-gray-800 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-br from-sky-100 via-indigo-100 to-pink-100 p-3 min-h-[420px]">
                  <div className="card p-3">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                      <div className="h-full rounded-full bg-green-500" style={{ width: '80%' }} />
                    </div>
                    <div className={`mb-3 grid gap-1 ${activePreviewCount === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {previewUrls.filter(Boolean).map((url, i, arr) => (
                        <div
                          key={i}
                          className={`rounded-lg overflow-hidden bg-gray-100 ${
                            arr.length === 3 && i === 0 ? 'col-span-2' : ''
                          }`}
                        >
                          <img
                            src={url as string}
                            alt=""
                            className={`w-full object-cover ${arr.length === 1 ? 'h-32' : 'h-16'}`}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs font-bold text-gray-800 leading-snug">
                      {formText || '問題文がここに表示されます'}
                    </p>
                    <div className="mt-3 h-6 bg-white/80 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? '保存中...' : '保存'}
            </button>
            <button onClick={resetForm} className="px-4 py-2 text-gray-500 hover:text-gray-800">
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {questions.map((q, idx) => (
          <div key={q.id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200">
            <div className="flex flex-col gap-1">
              <button onClick={() => moveQuestion(idx, 'up')} className="text-gray-400 hover:text-gray-800 text-xs">▲</button>
              <button onClick={() => moveQuestion(idx, 'down')} className="text-gray-400 hover:text-gray-800 text-xs">▼</button>
            </div>
            <div className="flex-1">
              <p className="text-gray-800 font-medium truncate">{q.question_text}</p>
              <p className="text-gray-500 text-sm">
                {q.question_type === 'choice' ? `☑️ 選択式(${q.choices?.length ?? 0}択)` : '✏️ 記述式'}
                {' / '}難易度{q.difficulty} / {q.points}点 / {q.time_limit}秒{q.image_urls && q.image_urls.length > 0 ? ` / 🖼️${q.image_urls.length}枚` : ''}
              </p>
            </div>
            <button onClick={() => editQuestion(q)} className="text-blue-500 hover:text-blue-600 text-sm">編集</button>
            <button onClick={() => deleteQuestion(q.id)} className="text-red-500 hover:text-red-600 text-sm">削除</button>
          </div>
        ))}
        {questions.length === 0 && (
          <p className="text-gray-400 text-center py-8">問題がまだありません</p>
        )}
      </div>
    </div>
  );
}
