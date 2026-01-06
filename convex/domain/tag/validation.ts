import { TAG_COLORS, TAG_LIMITS, TagColor } from "./types";

/**
 * タグ名のバリデーション
 */
export function validateTagName(name: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = name.trim();

  if (trimmed.length < TAG_LIMITS.MIN_NAME_LENGTH) {
    return { valid: false, error: "タグ名を入力してください" };
  }

  if (trimmed.length > TAG_LIMITS.MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: `タグ名は${TAG_LIMITS.MAX_NAME_LENGTH}文字以内で入力してください`,
    };
  }

  return { valid: true };
}

/**
 * タグの色バリデーション
 */
export function isValidTagColor(color: string): color is TagColor {
  return TAG_COLORS.includes(color as TagColor);
}

/**
 * ランダムなタグ色を取得
 */
export function getRandomTagColor(): TagColor {
  const index = Math.floor(Math.random() * TAG_COLORS.length);
  return TAG_COLORS[index];
}

/**
 * タグ名を正規化（前後の空白を除去）
 */
export function normalizeTagName(name: string): string {
  return name.trim();
}
