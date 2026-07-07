export type OsType = "ios" | "android" | "desktop" | "other";

export type BrowserType =
  "safari" | "chrome" | "edge" | "firefox" | "samsung" | "other";

export type DeviceType =
  | "iosSafari"
  | "iosOther"
  | "androidChrome"
  | "androidOther"
  | "desktopChrome"
  | "desktopSafari"
  | "desktopFirefox"
  | "other";

export type DeviceCategory = "mobile" | "desktop";

export type DetectInput = {
  userAgent: string;
  maxTouchPoints?: number;
};

export function detectOs(input: DetectInput): OsType {
  const ua = input.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  // iPadOS 13+ は Mac の Desktop UA を詐称するため touchPoints で補正
  if (/Macintosh/i.test(ua) && (input.maxTouchPoints ?? 0) > 1) {
    return "ios";
  }
  if (/Android/i.test(ua)) return "android";
  if (/(Windows|Macintosh|Linux|CrOS)/i.test(ua)) return "desktop";
  return "other";
}

export function detectBrowser(input: DetectInput): BrowserType {
  const ua = input.userAgent;
  if (/Edg\//i.test(ua)) return "edge";
  if (/SamsungBrowser/i.test(ua)) return "samsung";
  if (/(Firefox|FxiOS)/i.test(ua)) return "firefox";
  if (/(Chrome|CriOS)/i.test(ua)) return "chrome";
  if (/Safari/i.test(ua)) return "safari";
  return "other";
}

export function detectDevice(input: DetectInput): DeviceType {
  const os = detectOs(input);
  const browser = detectBrowser(input);

  if (os === "ios") {
    return browser === "safari" ? "iosSafari" : "iosOther";
  }
  if (os === "android") {
    if (browser === "chrome" || browser === "edge" || browser === "samsung") {
      return "androidChrome";
    }
    return "androidOther";
  }
  if (os === "desktop") {
    if (browser === "chrome" || browser === "edge") return "desktopChrome";
    if (browser === "safari") return "desktopSafari";
    if (browser === "firefox") return "desktopFirefox";
    return "other";
  }
  return "other";
}

export function detectDeviceCategory(input: DetectInput): DeviceCategory {
  const os = detectOs(input);
  return os === "ios" || os === "android" ? "mobile" : "desktop";
}
