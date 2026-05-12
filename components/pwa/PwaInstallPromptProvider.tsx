"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type InstallPromptOutcome = "accepted" | "dismissed" | "unavailable";

type PwaInstallPromptContextValue = {
  canPrompt: boolean;
  showPrompt: () => Promise<InstallPromptOutcome>;
  isAppInstalledViaEvent: boolean;
};

const PwaInstallPromptContext =
  createContext<PwaInstallPromptContextValue | null>(null);

export function PwaInstallPromptProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalledViaEvent, setIsAppInstalledViaEvent] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => {
      setIsAppInstalledViaEvent(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const showPrompt = useCallback(async (): Promise<InstallPromptOutcome> => {
    if (!deferredPrompt) return "unavailable";
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return choice.outcome;
  }, [deferredPrompt]);

  return (
    <PwaInstallPromptContext.Provider
      value={{
        canPrompt: deferredPrompt !== null,
        showPrompt,
        isAppInstalledViaEvent,
      }}
    >
      {children}
    </PwaInstallPromptContext.Provider>
  );
}

export function usePwaInstallPromptContext(): PwaInstallPromptContextValue {
  const value = useContext(PwaInstallPromptContext);
  if (!value) {
    throw new Error(
      "usePwaInstallPromptContext must be used within PwaInstallPromptProvider",
    );
  }
  return value;
}
