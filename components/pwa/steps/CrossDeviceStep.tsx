"use client";

import { useEffect } from "react";
import { QrCode } from "@/components/pwa/QrCode";
import { trackEvent } from "@/lib/analytics";
import type { DeviceCategory } from "@/lib/pwaDetect";

type Props = {
  category: DeviceCategory;
};

const APP_URL = "https://pairbo.app";

export function CrossDeviceStep({ category }: Props) {
  useEffect(() => {
    if (category === "desktop") {
      trackEvent("qr_code_shown");
    }
  }, [category]);

  if (category === "mobile") {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-800">
          PCからも同じアカウントで使えます
        </h2>
        <p className="text-sm text-slate-600">
          家でゆっくり集計したいときは、PC のブラウザから
          <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
            pairbo.app
          </code>
          にアクセスすれば同じデータが使えます。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-800">
        スマホからも同じアカウントで使えます
      </h2>
      <p className="text-sm text-slate-600">
        外出先でもサッと記録するために、スマホでも開いてみてください。下の QR
        をスマホで読み取ると開けます。
      </p>
      <div className="flex justify-center pt-1">
        <QrCode value={APP_URL} />
      </div>
    </div>
  );
}
