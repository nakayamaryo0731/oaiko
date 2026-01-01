import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * 無料プランの制限
 * 注: グループ数・メンバー数の制限は同棲カップル向けアプリのため廃止
 * 代わりに広告表示やデータエクスポート等で差別化予定
 */
export const FREE_PLAN_LIMITS = {
  historyMonths: 12,
};

/**
 * サブスクリプションプランを取得
 */
export async function getUserPlan(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<"free" | "premium"> {
  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  if (!subscription) {
    return "free";
  }

  // active または trialing 状態で、かつ有効期限内ならpremium
  if (
    (subscription.status === "active" || subscription.status === "trialing") &&
    subscription.plan === "premium"
  ) {
    return "premium";
  }

  // canceled でも期間終了まではpremium
  if (
    subscription.status === "canceled" &&
    subscription.plan === "premium" &&
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd > Date.now()
  ) {
    return "premium";
  }

  return "free";
}

/**
 * プレミアムプランかどうかを確認
 */
export async function isPremium(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<boolean> {
  const plan = await getUserPlan(ctx, userId);
  return plan === "premium";
}

/**
 * @deprecated isPremium を使用してください
 */
export const isPro = isPremium;

// グループ数・メンバー数の制限は廃止（同棲カップル向けアプリのため不要）

/**
 * 詳細分析機能にアクセスできるかどうかを確認
 */
export async function canAccessDetailedAnalytics(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<boolean> {
  return isPro(ctx, userId);
}

/**
 * データエクスポート機能にアクセスできるかどうかを確認
 */
export async function canExportData(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<boolean> {
  return isPro(ctx, userId);
}
