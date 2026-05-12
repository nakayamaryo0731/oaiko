"use client";

import { MoreVertical } from "lucide-react";

export function AndroidManualGuide() {
  return (
    <div className="space-y-3 text-sm text-slate-700">
      <p>手動でホーム画面に追加できます:</p>
      <ol className="space-y-2">
        <li className="flex items-start gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
            1
          </span>
          <span>
            ブラウザ右上の
            <span className="mx-1 inline-flex items-center align-middle text-slate-600">
              <MoreVertical className="h-4 w-4" />
            </span>
            <strong>メニュー</strong>をタップ
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
            2
          </span>
          <span>
            <strong>「アプリをインストール」</strong>または
            <strong>「ホーム画面に追加」</strong>をタップ
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
            3
          </span>
          <span>
            確認ダイアログで<strong>「インストール」</strong>を選択
          </span>
        </li>
      </ol>
    </div>
  );
}
