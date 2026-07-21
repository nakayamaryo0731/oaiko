"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useGroupPremium } from "@/hooks";
import { ProPromoBanner } from "./ProPromoBanner";

type AdBannerProps = {
  /** TabNavigationの上に配置する場合はtrue（グループ詳細ページ用） */
  aboveTabNav?: boolean;
  /** グループ詳細ページでの非表示ロジックをスキップ（GroupDetail内で使用時） */
  skipPageCheck?: boolean;
};

/**
 * 広告バナーコンポーネント
 * - Premium（グループ画面ではグループ内にPremiumメンバーがいる場合も含む）: 表示しない
 * - Freeユーザー/未ログイン: 広告を表示
 * - グループ詳細ページ: layout.tsxからは非表示（GroupDetailで個別に表示）
 */
export function AdBanner({
  aboveTabNav = false,
  skipPageCheck = false,
}: AdBannerProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useConvexAuth();

  // グループ画面ではグループ単位のPremium判定（ペアプラン）を使う
  const groupId = pathname?.match(/^\/groups\/([^/]+)(\/|$)/)?.[1] as
    Id<"groups"> | undefined;
  const groupPremium = useGroupPremium(groupId);

  // 認証済みの場合のみサブスク状態を取得
  const subscription = useQuery(
    api.subscriptions.getMySubscription,
    isAuthenticated ? {} : "skip",
  );

  // グループ詳細ページではlayout.tsxからは非表示（GroupDetailで個別に表示するため）
  if (!skipPageCheck) {
    const isGroupDetailPage =
      pathname?.match(/^\/groups\/[^/]+$/) !== null ||
      pathname?.match(/^\/groups\/[^/]+\/shopping$/) !== null;

    if (isGroupDetailPage) {
      return null;
    }
  }

  // 認証ローディング中は表示しない（ちらつき防止）
  if (isLoading) {
    return null;
  }

  // サブスクリプション読み込み中は表示しない（ちらつき防止）
  if (
    isAuthenticated &&
    (subscription === undefined || groupPremium.isLoading)
  ) {
    return null;
  }

  // Premiumユーザー、またはPremiumメンバーのいるグループの画面では広告非表示
  if (subscription?.plan === "premium" || groupPremium.isPremium) {
    return null;
  }

  // Freeユーザーまたは未ログインユーザーにPro誘導バナーを表示
  return <ProPromoBanner aboveTabNav={aboveTabNav} />;
}
