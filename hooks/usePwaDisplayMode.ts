"use client";

import { useSyncExternalStore } from "react";

type IosStandaloneNavigator = Navigator & { standalone?: boolean };

let cachedMediaQuery: MediaQueryList | null = null;
const getMediaQuery = (): MediaQueryList => {
  if (!cachedMediaQuery) {
    cachedMediaQuery = window.matchMedia("(display-mode: standalone)");
  }
  return cachedMediaQuery;
};

const subscribe = (callback: () => void) => {
  const mq = getMediaQuery();
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
};

const getSnapshot = (): boolean => {
  const mq = getMediaQuery();
  const iosStandalone =
    (window.navigator as IosStandaloneNavigator).standalone === true;
  return mq.matches || iosStandalone;
};

const getServerSnapshot = (): boolean => false;

export function usePwaDisplayMode() {
  const isStandalone = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return { isStandalone };
}
