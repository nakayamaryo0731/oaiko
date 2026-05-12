"use client";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { InstallButton } from "@/components/pwa/InstallButton";
import { DesktopSafariGuide } from "@/components/pwa/guides/DesktopSafariGuide";
import type { DeviceType } from "@/lib/pwaDetect";

type Props = {
  device: DeviceType;
};

export function DesktopBrowserStep({ device }: Props) {
  const { canPrompt } = useInstallPrompt();

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-800">
        PCならブラウザでそのまま使えます
      </h2>
      <p className="text-sm text-slate-600">
        Pairbo は Web アプリとして PC
        のブラウザでしっかり動きます。今のままで使い続けて大丈夫です。
      </p>
      {canPrompt && (
        <div className="space-y-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-600">
            アプリのようにインストールしたい場合は:
          </p>
          <InstallButton label="アプリのようにインストール" variant="outline" />
        </div>
      )}
      {!canPrompt && device === "desktopSafari" && (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3">
          <DesktopSafariGuide />
        </div>
      )}
    </div>
  );
}
