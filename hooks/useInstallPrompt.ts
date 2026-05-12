"use client";

import { usePwaInstallPromptContext } from "@/components/pwa/PwaInstallPromptProvider";

export function useInstallPrompt() {
  const { canPrompt, showPrompt, isAppInstalledViaEvent } =
    usePwaInstallPromptContext();
  return { canPrompt, showPrompt, isAppInstalledViaEvent };
}
