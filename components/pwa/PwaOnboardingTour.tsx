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

  const handleOpenChange = async (next: boolean) => {
    if (!next && open) {
      setOpen(false);
      trackEvent("onboarding_tour_skipped");
      await completePwaOnboarding();
    } else {
      setOpen(next);
    }
  };

  const handleComplete = async () => {
    setOpen(false);
    trackEvent("onboarding_tour_completed");
    await completePwaOnboarding();
  };

  return (
    <PwaTourStepper
      open={open}
      onOpenChange={handleOpenChange}
      onComplete={handleComplete}
    />
  );
}
