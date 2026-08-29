/**
 * 表記揺れ正規化ロジック
 * 1. 全角英数字・スペースの半角化
 * 2. 英字の小文字化
 * 3. 前後の空白・記号除去
 * 4. カタカナからひらがなへの変換
 */

// 全角→半角変換
function toHalfWidth(str: string): string {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0)
  ).replace(/　/g, ' ');
}

// カタカナ→ひらがな変換
function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0x60)
  );
}

// 前後の不要な空白・記号の除去
function trimSymbols(str: string): string {
  return str.replace(/^[\s、。・,.\-\s]+|[\s、。・,.\-\s]+$/g, '');
}

export function normalizeAnswer(input: string): string {
  let result = input;
  // Step 1: 全角→半角
  result = toHalfWidth(result);
  // Step 2: 小文字化
  result = result.toLowerCase();
  // Step 3: 前後の不要記号・空白除去
  result = trimSymbols(result);
  // Step 4: カタカナ→ひらがな
  result = katakanaToHiragana(result);
  // 追加: 内部の連続スペースを1つに
  result = result.replace(/\s+/g, ' ');
  return result;
}

/**
 * 正誤判定: 正規化後の回答が正解配列のいずれかに一致すればtrue
 */
export function checkAnswer(userInput: string, correctAnswers: string[]): boolean {
  const normalizedInput = normalizeAnswer(userInput);
  return correctAnswers.some(
    (correct) => normalizeAnswer(correct) === normalizedInput
  );
}