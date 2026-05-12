"use client";

import { useSyncExternalStore } from "react";
import {
  detectDevice,
  detectDeviceCategory,
  type DeviceCategory,
  type DeviceType,
} from "@/lib/pwaDetect";

type DeviceSnapshot = {
  device: DeviceType;
  category: DeviceCategory;
};

const SERVER_SNAPSHOT: DeviceSnapshot = {
  device: "other",
  category: "desktop",
};

let cachedClientSnapshot: DeviceSnapshot | null = null;

const getClientSnapshot = (): DeviceSnapshot => {
  if (cachedClientSnapshot) return cachedClientSnapshot;
  const input = {
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints,
  };
  cachedClientSnapshot = {
    device: detectDevice(input),
    category: detectDeviceCategory(input),
  };
  return cachedClientSnapshot;
};

const getServerSnapshot = (): DeviceSnapshot => SERVER_SNAPSHOT;

const subscribe = () => () => {};

export function useDeviceType(): DeviceSnapshot & { isHydrated: boolean } {
  const snapshot = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  return { ...snapshot, isHydrated: snapshot !== SERVER_SNAPSHOT };
}
