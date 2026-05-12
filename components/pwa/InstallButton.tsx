"use client";

import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { trackEvent } from "@/lib/analytics";
import { Download } from "lucide-react";
import type { ComponentProps } from "react";

type InstallButtonProps = {
  label?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  onAccepted?: () => void;
};

export function InstallButton({
  label = "アプリ化する",
  variant = "default",
  onAccepted,
}: InstallButtonProps) {
  const { canPrompt, showPrompt } = useInstallPrompt();
  if (!canPrompt) return null;

  return (
    <Button
      type="button"
      variant={variant}
      onClick={async () => {
        trackEvent("install_prompt_shown");
        const outcome = await showPrompt();
        if (outcome === "accepted") {
          trackEvent("install_prompt_accepted");
          onAccepted?.();
        } else if (outcome === "dismissed") {
          trackEvent("install_prompt_dismissed");
        }
      }}
    >
      <Download className="h-4 w-4" />
      {label}
    </Button>
  );
}
