"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Gift } from "lucide-react";

/**
 * 招待 UI で free ユーザーに「成立で双方 Premium 1ヶ月無料」を訴求するバッジ。
 * Premium / trial 中 / planOverride ユーザーには非表示。
 */
export function InviteRewardBadge() {
  const subscription = useQuery(api.subscriptions.getMySubscription);

  if (!subscription) return null;
  if (subscription.plan === "premium") return null;

  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-left">
      <Gift className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
      <div className="text-xs text-amber-900 leading-relaxed">
        <p className="font-medium">招待が成立すると</p>
        <p>
          あなたとお相手の両方が
          <br />
          <span className="font-medium">Premium プラン 1ヶ月無料</span>{" "}
          で使えます
        </p>
      </div>
    </div>
  );
}
