export type ReleaseAudience = "all" | "non-paying";

export type Release = {
  /** 一意なID（YYYY-MM-DD-slug 形式推奨） */
  id: string;
  /** 公開日時のタイムスタンプ（Date.UTC(...)で生成） */
  publishedAt: number;
  /** リリースタイトル */
  title: string;
  /** リリース本文（プレーンテキスト、改行で段落分け） */
  body: string;
  /**
   * 配信対象（省略時は "all"）。
   * "non-paying" を指定すると、Stripe で active / 期間内 canceled の課金中ユーザーには表示しない。
   */
  audience?: ReleaseAudience;
};

/**
 * リリースノート一覧
 *
 * 追加方法:
 * - 配列末尾に新しいエントリを追加
 * - publishedAt は `Date.UTC(year, monthIndex, day)` で生成（monthは0始まり）
 */
export const releases: Release[] = [
  {
    id: "2026-05-11-notifications",
    publishedAt: Date.UTC(2026, 4, 11),
    title: "新着情報のお知らせ機能を追加しました",
    body: "ヘッダーのベルアイコンから、Pairboの新機能や改善のお知らせが見られるようになりました。\n今後はアップデートのたびにこちらでお知らせします。",
  },
  {
    id: "2026-05-12-google-sheets-export",
    publishedAt: Date.UTC(2026, 4, 12),
    title: "Googleスプレッドシートへのエクスポートに対応しました（Premium）",
    body: "分析タブから、支出データをGoogleスプレッドシートに書き出せるようになりました。\n期間を選んでエクスポートすると、お使いのGoogleドライブに集計表が作成されます。",
  },
  {
    id: "2026-05-17-invite-reward-trial",
    publishedAt: Date.UTC(2026, 4, 17),
    title: "招待が成立すると2人とも Premium 1ヶ月無料に！",
    body: "招待リンクから新しいメンバーが参加すると、招待した方も参加した方も Premium プランを30日間無料で体験できるようになりました。\n傾斜折半・タグ・年間分析などの機能をぜひ試してみてください。\n期間終了後は自動で無料プランに戻ります（自動課金は発生しません）。",
    audience: "non-paying",
  },
];

/** リリース可視性判定で必要となる、ユーザーの支払い状況コンテキスト */
export type ReleaseAudienceContext = {
  plan: "free" | "premium" | null;
  status: "active" | "canceled" | "past_due" | "trialing" | null;
  currentPeriodEnd: number | null;
};

/** Stripe で課金中（active）または canceled だが期間内の Premium ユーザーかどうか */
function isPayingStripePremium(
  ctx: ReleaseAudienceContext,
  now: number = Date.now(),
): boolean {
  if (ctx.plan !== "premium") return false;
  if (ctx.status === "active") return true;
  if (
    ctx.status === "canceled" &&
    ctx.currentPeriodEnd != null &&
    ctx.currentPeriodEnd > now
  ) {
    return true;
  }
  return false;
}

/** 個別リリースが特定ユーザーに見えるか判定する */
export function isReleaseVisibleTo(
  release: Release,
  ctx: ReleaseAudienceContext,
  now: number = Date.now(),
): boolean {
  const audience = release.audience ?? "all";
  if (audience === "all") return true;
  if (audience === "non-paying") return !isPayingStripePremium(ctx, now);
  return true;
}

/** 公開日時の降順（新しい順）でリリースを取得 */
export function getReleasesDesc(): Release[] {
  return [...releases].sort((a, b) => b.publishedAt - a.publishedAt);
}

/** 支払い状況に応じて可視リリースを降順で取得 */
export function getVisibleReleasesDesc(
  ctx: ReleaseAudienceContext,
  now: number = Date.now(),
): Release[] {
  return getReleasesDesc().filter((r) => isReleaseVisibleTo(r, ctx, now));
}

/** 未読リリースがあるかどうか（リストを渡さない場合は全リリース対象） */
export function hasUnreadRelease(
  lastSeenAt: number | undefined,
  releasesList: Release[] = releases,
): boolean {
  const threshold = lastSeenAt ?? 0;
  return releasesList.some((r) => r.publishedAt > threshold);
}
