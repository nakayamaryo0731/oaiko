"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { useDeviceType } from "@/hooks/useDeviceType";
import { usePwaDisplayMode } from "@/hooks/usePwaDisplayMode";
import { IntroStep } from "./steps/IntroStep";
import { MobileInstallStep } from "./steps/MobileInstallStep";
import { DesktopBrowserStep } from "./steps/DesktopBrowserStep";
import { CrossDeviceStep } from "./steps/CrossDeviceStep";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete: () => void;
};

const TOTAL_STEPS = 3;

export function PwaTourStepper({ open, onOpenChange, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const { device, category } = useDeviceType();
  const { isStandalone } = usePwaDisplayMode();

  useEffect(() => {
    if (open) {
      trackEvent("onboarding_tour_step_viewed", { step });
    }
  }, [step, open]);

  const handleOpenChange = (next: boolean) => {
    if (!next) setStep(0);
    onOpenChange(next);
  };

  const stepContent = useMemo(() => {
    if (step === 0) return <IntroStep />;
    if (step === 1) {
      return category === "mobile" ? (
        <MobileInstallStep device={device} isStandalone={isStandalone} />
      ) : (
        <DesktopBrowserStep device={device} />
      );
    }
    return <CrossDeviceStep category={category} />;
  }, [step, category, device, isStandalone]);

  const isLast = step === TOTAL_STEPS - 1;
  const isFirst = step === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">アプリの使い方ガイド</DialogTitle>
        <DialogDescription className="sr-only">
          Pairbo の使い方を案内します
        </DialogDescription>
        <div className="min-h-[220px]">{stepContent}</div>
        <div className="flex justify-center gap-1.5 pt-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i === step ? "bg-blue-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 pt-2">
          {isFirst ? (
            <Button
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              type="button"
            >
              スキップ
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              type="button"
            >
              戻る
            </Button>
          )}
          {isLast ? (
            <Button onClick={onComplete} type="button">
              完了
            </Button>
          ) : (
            <Button onClick={() => setStep((s) => s + 1)} type="button">
              次へ
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
