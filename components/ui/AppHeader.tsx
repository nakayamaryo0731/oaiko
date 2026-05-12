"use client";

import type { ReactNode } from "react";
import { OpenOnOtherDeviceButton } from "@/components/pwa/OpenOnOtherDeviceButton";

type AppHeaderProps = {
  /** アプリ/ブランド名（左側） */
  title?: string;
  /** 右側に表示する要素（認証状態など） */
  rightElement?: ReactNode;
};

/**
 * アプリ共通ヘッダーコンポーネント（ホーム画面用）
 * - 左: アプリブランド表示
 * - 右: PC向け QR ボタン + ユーザー認証状態
 */
export function AppHeader({ title = "Pairbo", rightElement }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-4 h-14">
        <h1 className="font-bold text-xl text-slate-800">{title}</h1>
        <div className="flex items-center gap-1">
          <OpenOnOtherDeviceButton />
          {rightElement ?? <div className="w-8" />}
        </div>
      </div>
    </header>
  );
}
