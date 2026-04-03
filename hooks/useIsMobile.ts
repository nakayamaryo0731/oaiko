import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
