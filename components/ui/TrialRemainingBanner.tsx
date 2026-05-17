"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Clock } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import {
  readTrialState,
  TRIAL_REMAINING_BANNER_THRESHOLD_DAYS,
} from "@/lib/trial";

/**
 * Premium trial 期間中の最後の数日（残り3日以下）にだけ表示する課金導線バナー。
 * Stripe で課金中のユーザー（active / canceled-period内）には trial が同時に有効でも非表示。
 */
export function TrialRemainingBanner() {
  const subscription = useQuery(api.subscriptions.getMySubscription);
  const lastTrackedDaysRef = useRef<number | null>(null);

  const trial = readTrialState(subscription?.trialExpiresAt);
  // Stripe で active 課金中 / Stripe Trial 中は除外（こちらは別途 currentPeriodEnd で表示）。
  // それ以外（subscription なし / canceled / past_due）で trial 期限が残ってる場合に表示。
  const onStripePaid =
    subscription?.status === "active" || subscription?.status === "trialing";
  const showBanner =
    subscription !== undefined &&
    trial.kind === "active" &&
    trial.daysLeft <= TRIAL_REMAINING_BANNER_THRESHOLD_DAYS &&
    !onStripePaid;

  useEffect(() => {
    if (!showBanner) return;
    if (trial.kind !== "active") return;
    if (lastTrackedDaysRef.current === trial.daysLeft) return;
    trackEvent("trial_remaining_banner_shown", { daysLeft: trial.daysLeft });
    lastTrackedDaysRef.current = trial.daysLeft;
  }, [showBanner, trial]);

  if (!showBanner) return null;
  if (trial.kind !== "active") return null;

  return (
    <div className="px-4 pt-3">
      <Link
        href="/pricing"
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 transition-colors"
      >
        <Clock className="h-4 w-4 shrink-0" />
        <div className="flex-1 min-w-0 text-sm">
          <span className="font-medium">
            Premium トライアルが残り {trial.daysLeft}日
          </span>
          <span className="ml-2 text-xs text-amber-700">
            月額100円で継続できます
          </span>
        </div>
      </Link>
    </div>
  );
}
