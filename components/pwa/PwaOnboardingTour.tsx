"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { trackEvent } from "@/lib/analytics";
import { usePwaDisplayMode } from "@/hooks/usePwaDisplayMode";
import { PwaTourStepper } from "./PwaTourStepper";

const TOUR_OPEN_DELAY_MS = 500;

export function PwaOnboardingTour() {
  const me = useQuery(api.users.getMe);
  const completePwaOnboarding = useMutation(api.users.completePwaOnboarding);
  const { isStandalone } = usePwaDisplayMode();
  const [open, setOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (hasShown) return;
    if (!me) return;
    if (isStandalone) return;
    if (me.pwaOnboardingCompletedAt) return;

    // モーダル過多を避けるため少しディレイ
    const timer = setTimeout(() => {
      setOpen(true);
      setHasShown(true);
      trackEvent("onboarding_tour_started");
    }, TOUR_OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [me, isStandalone, hasShown]);

  const markCompleted = (reason: "skipped" | "completed") => {
    trackEvent(
      reason === "skipped"
        ? "onboarding_tour_skipped"
        : "onboarding_tour_completed",
    );
    // Radix の onOpenChange は同期コールバックなので fire-and-forget。
    // 失敗してもこのセッション内では hasShown で再表示を抑止する。
    completePwaOnboarding().catch((error) => {
      console.error("Failed to mark PWA onboarding complete:", error);
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && open) {
      setOpen(false);
      markCompleted("skipped");
    } else {
      setOpen(next);
    }
  };

  const handleComplete = () => {
    setOpen(false);
    markCompleted("completed");
  };

  return (
    <PwaTourStepper
      open={open}
      onOpenChange={handleOpenChange}
      onComplete={handleComplete}
    />
  );
}
