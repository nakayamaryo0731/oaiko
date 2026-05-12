import { describe, expect, test } from "vitest";
import {
  detectBrowser,
  detectDevice,
  detectDeviceCategory,
  detectOs,
} from "../pwaDetect";

const UA = {
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1",
  iphoneFirefox:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/121.0 Mobile/15E148 Safari/605.1.15",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  androidSamsung:
    "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36",
  androidFirefox:
    "Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0",
  desktopChrome:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  desktopEdge:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  desktopSafari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  desktopFirefox:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  // iPadOS は Mac の Desktop UA を詐称するため maxTouchPoints で補正する必要あり
  ipadDesktopUa:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
};

describe("detectOs", () => {
  test("iPhone は ios", () => {
    expect(detectOs({ userAgent: UA.iphoneSafari })).toBe("ios");
  });

  test("Android は android", () => {
    expect(detectOs({ userAgent: UA.androidChrome })).toBe("android");
  });

  test("Windows は desktop", () => {
    expect(detectOs({ userAgent: UA.desktopChrome })).toBe("desktop");
  });

  test("Mac は desktop", () => {
    expect(detectOs({ userAgent: UA.desktopSafari })).toBe("desktop");
  });

  test("iPadOS の Desktop UA 詐称は maxTouchPoints で ios に補正", () => {
    expect(
      detectOs({
        userAgent: UA.ipadDesktopUa,
        maxTouchPoints: 5,
      }),
    ).toBe("ios");
  });

  test("Mac で maxTouchPoints が 0 なら desktop", () => {
    expect(
      detectOs({
        userAgent: UA.desktopSafari,
        maxTouchPoints: 0,
      }),
    ).toBe("desktop");
  });

  test("不明な UA は other", () => {
    expect(detectOs({ userAgent: "RandomBot/1.0" })).toBe("other");
  });
});

describe("detectBrowser", () => {
  test("Edge は edge（Chrome より優先）", () => {
    expect(detectBrowser({ userAgent: UA.desktopEdge })).toBe("edge");
  });

  test("SamsungBrowser は samsung（Chrome より優先）", () => {
    expect(detectBrowser({ userAgent: UA.androidSamsung })).toBe("samsung");
  });

  test("Firefox は firefox", () => {
    expect(detectBrowser({ userAgent: UA.desktopFirefox })).toBe("firefox");
  });

  test("iOS Firefox (FxiOS) も firefox", () => {
    expect(detectBrowser({ userAgent: UA.iphoneFirefox })).toBe("firefox");
  });

  test("Chrome は chrome", () => {
    expect(detectBrowser({ userAgent: UA.desktopChrome })).toBe("chrome");
  });

  test("iOS Chrome (CriOS) も chrome", () => {
    expect(detectBrowser({ userAgent: UA.iphoneChrome })).toBe("chrome");
  });

  test("Safari は safari", () => {
    expect(detectBrowser({ userAgent: UA.iphoneSafari })).toBe("safari");
  });

  test("不明な UA は other", () => {
    expect(detectBrowser({ userAgent: "RandomBot/1.0" })).toBe("other");
  });
});

describe("detectDevice", () => {
  test("iPhone Safari → iosSafari", () => {
    expect(detectDevice({ userAgent: UA.iphoneSafari })).toBe("iosSafari");
  });

  test("iPhone Chrome → iosOther", () => {
    expect(detectDevice({ userAgent: UA.iphoneChrome })).toBe("iosOther");
  });

  test("iPhone Firefox → iosOther", () => {
    expect(detectDevice({ userAgent: UA.iphoneFirefox })).toBe("iosOther");
  });

  test("Android Chrome → androidChrome", () => {
    expect(detectDevice({ userAgent: UA.androidChrome })).toBe("androidChrome");
  });

  test("Samsung Internet → androidChrome（canPromptサポート扱い）", () => {
    expect(detectDevice({ userAgent: UA.androidSamsung })).toBe(
      "androidChrome",
    );
  });

  test("Android Firefox → androidOther", () => {
    expect(detectDevice({ userAgent: UA.androidFirefox })).toBe("androidOther");
  });

  test("Desktop Chrome → desktopChrome", () => {
    expect(detectDevice({ userAgent: UA.desktopChrome })).toBe("desktopChrome");
  });

  test("Desktop Edge → desktopChrome", () => {
    expect(detectDevice({ userAgent: UA.desktopEdge })).toBe("desktopChrome");
  });

  test("Desktop Safari → desktopSafari", () => {
    expect(detectDevice({ userAgent: UA.desktopSafari })).toBe("desktopSafari");
  });

  test("Desktop Firefox → desktopFirefox", () => {
    expect(detectDevice({ userAgent: UA.desktopFirefox })).toBe(
      "desktopFirefox",
    );
  });

  test("iPadOS は iosSafari として判定（Desktop UA 詐称対応）", () => {
    expect(
      detectDevice({
        userAgent: UA.ipadDesktopUa,
        maxTouchPoints: 5,
      }),
    ).toBe("iosSafari");
  });
});

describe("detectDeviceCategory", () => {
  test("iOS は mobile", () => {
    expect(detectDeviceCategory({ userAgent: UA.iphoneSafari })).toBe("mobile");
  });

  test("Android は mobile", () => {
    expect(detectDeviceCategory({ userAgent: UA.androidChrome })).toBe(
      "mobile",
    );
  });

  test("Desktop は desktop", () => {
    expect(detectDeviceCategory({ userAgent: UA.desktopChrome })).toBe(
      "desktop",
    );
  });

  test("不明なものは desktop（PC向け案内をフォールバック）", () => {
    expect(detectDeviceCategory({ userAgent: "RandomBot/1.0" })).toBe(
      "desktop",
    );
  });
});
