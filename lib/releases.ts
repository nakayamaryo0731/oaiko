export type Release = {
  /** 一意なID（YYYY-MM-DD-slug 形式推奨） */
  id: string;
  /** 公開日時のタイムスタンプ（Date.UTC(...)で生成） */
  publishedAt: number;
  /** リリースタイトル */
  title: string;
  /** リリース本文（プレーンテキスト、改行で段落分け） */
  body: string;
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
  },
];

/** 公開日時の降順（新しい順）でリリースを取得 */
export function getReleasesDesc(): Release[] {
  return [...releases].sort((a, b) => b.publishedAt - a.publishedAt);
}

/** 未読リリースがあるかどうか */
export function hasUnreadRelease(lastSeenAt: number | undefined): boolean {
  const threshold = lastSeenAt ?? 0;
  return releases.some((r) => r.publishedAt > threshold);
}
