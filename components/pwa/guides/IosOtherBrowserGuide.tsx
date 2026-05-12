"use client";

export function IosOtherBrowserGuide() {
  return (
    <div className="space-y-3 text-sm text-slate-700">
      <p>
        iOSでは<strong>Safari</strong>からのみホーム画面に追加できます。
        Safariでもう一度開き直してください。
      </p>
      <ol className="space-y-2 text-sm text-slate-700">
        <li className="flex items-start gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
            1
          </span>
          <span>
            <strong>Safari</strong>を開き、
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
              pairbo.app
            </code>
            にアクセス
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
            2
          </span>
          <span>
            画面下の<strong>共有ボタン</strong>をタップ
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
            3
          </span>
          <span>
            <strong>「ホーム画面に追加」</strong>→<strong>「追加」</strong>
          </span>
        </li>
      </ol>
    </div>
  );
}
