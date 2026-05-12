"use client";

import { useState, type ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";
import { PwaTourStepper } from "./PwaTourStepper";

type Props = {
  className?: string;
  children: ReactNode;
};

export function UsageGuideDialog({ className, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          setOpen(true);
          trackEvent("usage_guide_opened");
        }}
      >
        {children}
      </button>
      <PwaTourStepper
        open={open}
        onOpenChange={setOpen}
        onComplete={() => setOpen(false)}
      />
    </>
  );
}
