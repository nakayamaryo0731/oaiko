"use client";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { InstallButton } from "@/components/pwa/InstallButton";
import { IosSafariGuide } from "@/components/pwa/guides/IosSafariGuide";
import { IosOtherBrowserGuide } from "@/components/pwa/guides/IosOtherBrowserGuide";
import { AndroidManualGuide } from "@/components/pwa/guides/AndroidManualGuide";
import type { DeviceType } from "@/lib/pwaDetect";

type Props = {
  device: DeviceType;
  isStandalone: boolean;
};

export function MobileInstallStep({ device, isStandalone }: Props) {
  const { canPrompt } = useInstallPrompt();

  if (isStandalone) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-800">
          すでにアプリとして使っています
        </h2>
        <p className="text-sm text-slate-600">
          ホーム画面のアイコンから、いつでもアプリのように開けます。毎日サッと記録できる状態です。
        </p>
      </div>
    );
  }

  if (canPrompt) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-800">
          ホーム画面に追加できます
        </h2>
        <p className="text-sm text-slate-600">
          下のボタンを押すと、ホーム画面にアイコンが追加されてアプリのように使えます。
        </p>
        <div className="pt-2">
          <InstallButton label="ホーム画面に追加" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-800">
        スマホでアプリのように使えます
      </h2>
      <p className="text-sm text-slate-600">
        ホーム画面に追加すると、ブラウザを開かずに毎日サッと記録できます。
      </p>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        {device === "iosSafari" && <IosSafariGuide />}
        {device === "iosOther" && <IosOtherBrowserGuide />}
        {(device === "androidChrome" || device === "androidOther") && (
          <AndroidManualGuide />
        )}
      </div>
    </div>
  );
}
