"use client";

import { Smartphone, Monitor } from "lucide-react";

export function IntroStep() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          Pairboは2つの使い方ができます
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          スマホならホーム画面に追加してアプリのように、PCならブラウザでそのまま使えます。
          同じアカウントで両方使えるので、シーンに合わせて自由に切り替えできます。
        </p>
      </div>
      <div className="flex justify-center gap-6 pt-2">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
            <Smartphone className="h-7 w-7" />
          </div>
          <p className="text-xs font-medium text-slate-700">
            スマホで
            <br />
            アプリのように
          </p>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
            <Monitor className="h-7 w-7" />
          </div>
          <p className="text-xs font-medium text-slate-700">
            PCで
            <br />
            ブラウザで
          </p>
        </div>
      </div>
    </div>
  );
}
