'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Genre, Question } from '@/lib/types';

type ImageSlot = File | string | null;

export default function AdminQuestions() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // フォーム状態
  const [formGenre, setFormGenre] = useState('');
  const [formText, setFormText] = useState('');
  const [formAnswers, setFormAnswers] = useState('');
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

  // プレビューURLの生成/破棄
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
    setFormAnswers('');
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

  const handleSave = async () => {
    if (!formGenre || !formText.trim() || !formAnswers.trim()) {
      alert('ジャンル、問題文、正解は必須です');
      return;
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

    const answers = formAnswers.split(',').map((a) => a.trim()).filter(Boolean);

    const record = {
      genre_id: formGenre,
      question_text: formText,
      image_urls: imageUrls,
      correct_answers: answers,
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
    setFormAnswers(q.correct_answers.join(', '));
    setFormDifficulty(q.difficulty);
    setFormPoints(q.points);
    setFormTimeLimit(q.time_limit);
    const slots: ImageSlot[] = [null, null, null, null];
    (q.image_urls || []).slice(0, 4).forEach((url, i) => { slots[i] = url; });
    setImageSlots(slots);
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

    // sort_order を入れ替え
    const tempOrder = newQuestions[index].sort_order;
    await supabase.from('questions').update({ sort_order: newQuestions[swapIdx].sort_order }).eq('id', newQuestions[index].id);
    await supabase.from('questions').update({ sort_order: tempOrder }).eq('id', newQuestions[swapIdx].id);
    await fetchData();
  };

  const activePreviewCount = previewUrls.filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">❓ 問題管理</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
          ＋ 新規作成
        </button>
      </div>

      {/* フォーム */}
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
            <label className="text-sm text-gray-500 block mb-1">正解（カンマ区切りで複数可）</label>
            <input
              type="text"
              value={formAnswers}
              onChange={(e) => setFormAnswers(e.target.value)}
              placeholder="例: 徳川家康, とくがわいえやす"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800"
            />
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

          {/* 画像（最大4枚） */}
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

          {/* スマホ表示プレビュー */}
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

      {/* 問題一覧 */}
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
                難易度{q.difficulty} / {q.points}点 / {q.time_limit}秒{q.image_urls && q.image_urls.length > 0 ? ` / 🖼️${q.image_urls.length}枚` : ''}
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
