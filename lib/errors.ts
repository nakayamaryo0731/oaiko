/**
 * `unknown` 型の例外から表示用メッセージを取り出す。
 *
 * Convex の \`ConvexError\` も標準 \`Error\` を継承しているので `.message` で取れる。
 * 文字列を直接 throw されている場合や、未知の型の場合はフォールバック文言を返す。
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = "エラーが発生しました",
): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}
