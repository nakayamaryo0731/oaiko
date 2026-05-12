"use client";

import { useState } from "react";
import { Smartphone } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDeviceType } from "@/hooks/useDeviceType";
import { QrCode } from "@/components/pwa/QrCode";
import { trackEvent } from "@/lib/analytics";

const APP_URL = "https://pairbo.app";

export function OpenOnOtherDeviceButton() {
  const { category, isHydrated } = useDeviceType();
  const [open, setOpen] = useState(false);

  // ハイドレーション前はSSRと同じく非描画にして、スマホ側でのフラッシュを防ぐ
  if (!isHydrated) return null;
  if (category !== "desktop") return null;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) trackEvent("open_on_other_device_clicked");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
          aria-label="スマホで開く"
        >
          <Smartphone className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto">
        <p className="mb-3 max-w-[200px] text-center text-xs text-slate-600">
          スマホでこの QR を読み取ると、そのまま開けます
        </p>
        <div className="flex justify-center">
          <QrCode value={APP_URL} size={140} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
