import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export const TRIAL_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
// 招待を繰り返した場合の累計上限（およそ 1 年）。これを超える期間は加算されない。
export const MAX_ACCUMULATED_TRIAL_MS = 365 * 24 * 60 * 60 * 1000;

export type GrantInviteRewardArgs = {
  userId: Id<"users">;
  invitationId: Id<"groupInvitations">;
  reason: "inviter" | "invitee";
};

export type GrantInviteRewardResult =
  | { granted: true; expiresAt: number }
  | {
      granted: false;
      reason: "already_paying" | "duplicate" | "user_not_found";
    };

/**
 * 招待 accept 時に Premium trial を付与する。
 *
 * スキップ条件:
 * - 既存 active/trialing Stripe サブスクあり（既課金者）
 * - 同一招待×同一ユーザーで既に付与済み
 *
 * 既存 trial がある場合は期限を 30日加算（累計上限 365日）。
 */
export async function grantInviteReward(
  ctx: MutationCtx,
  args: GrantInviteRewardArgs,
): Promise<GrantInviteRewardResult> {
  const user = await ctx.db.get(args.userId);
  if (!user) return { granted: false, reason: "user_not_found" };

  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("by_user", (q) => q.eq("userId", args.userId))
    .unique();
  if (
    subscription?.plan === "premium" &&
    (subscription.status === "active" || subscription.status === "trialing")
  ) {
    return { granted: false, reason: "already_paying" };
  }

  const existing = await ctx.db
    .query("inviteRewards")
    .withIndex("by_invitation_user", (q) =>
      q.eq("invitationId", args.invitationId).eq("userId", args.userId),
    )
    .unique();
  if (existing) return { granted: false, reason: "duplicate" };

  const now = Date.now();
  const base = Math.max(user.trialExpiresAt ?? now, now);
  const newExpiresAt = Math.min(
    base + TRIAL_DURATION_MS,
    now + MAX_ACCUMULATED_TRIAL_MS,
  );

  await ctx.db.insert("inviteRewards", {
    userId: args.userId,
    invitationId: args.invitationId,
    reason: args.reason,
    grantedAt: now,
    expiresAt: newExpiresAt,
    durationMs: TRIAL_DURATION_MS,
  });

  await ctx.db.patch(args.userId, {
    trialExpiresAt: newExpiresAt,
    updatedAt: now,
  });

  return { granted: true, expiresAt: newExpiresAt };
}
