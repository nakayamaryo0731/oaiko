"use client";

import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * グループのPremium状態を取得（ペアプラン）
 * グループ内に1人でもPremiumメンバーがいれば isPremium: true
 */
export function useGroupPremium(groupId: Id<"groups"> | undefined) {
  const { isAuthenticated } = useConvexAuth();
  const result = useQuery(
    api.subscriptions.getGroupPremium,
    isAuthenticated && groupId ? { groupId } : "skip",
  );

  return {
    isPremium: result?.isPremium ?? false,
    isLoading: isAuthenticated && groupId !== undefined && result === undefined,
  };
}
