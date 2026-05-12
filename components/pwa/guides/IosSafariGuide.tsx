"use client";

import { Share, Plus } from "lucide-react";

export function IosSafariGuide() {
  return (
    <ol className="space-y-2.5 text-sm text-slate-700">
      <li className="flex items-start gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
          1
        </span>
        <span>
          画面下の
          <span className="mx-1 inline-flex items-center align-middle text-blue-600">
            <Share className="h-4 w-4" />
          </span>
          <strong>共有ボタン</strong>をタップ
        </span>
      </li>
      <li className="flex items-start gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
          2
        </span>
        <span>
          メニューから
          <span className="mx-1 inline-flex items-center align-middle text-slate-600">
            <Plus className="h-4 w-4" />
          </span>
          <strong>「ホーム画面に追加」</strong>をタップ
        </span>
      </li>
      <li className="flex items-start gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
          3
        </span>
        <span>
          右上の<strong>「追加」</strong>をタップ
        </span>
      </li>
    </ol>
  );
}
