const DAY_MS = 24 * 60 * 60 * 1000;
export const TRIAL_REMAINING_BANNER_THRESHOLD_DAYS = 3;

export type TrialState =
  { kind: "none" } | { kind: "active"; expiresAt: number; daysLeft: number };

/**
 * `getMySubscription` レスポンスの `trialExpiresAt` を解釈し、
 * 表示用の trial 状態を返す。
 */
export function readTrialState(
  trialExpiresAt: number | null | undefined,
  now: number = Date.now(),
): TrialState {
  if (trialExpiresAt == null) return { kind: "none" };
  if (trialExpiresAt <= now) return { kind: "none" };
  const daysLeft = Math.max(1, Math.ceil((trialExpiresAt - now) / DAY_MS));
  return { kind: "active", expiresAt: trialExpiresAt, daysLeft };
}
