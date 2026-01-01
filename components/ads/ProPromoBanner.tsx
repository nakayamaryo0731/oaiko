"use client";

import Link from "next/link";

type ProPromoBannerProps = {
  /** TabNavigationの上に配置する場合はtrue */
  aboveTabNav?: boolean;
};

/**
 * Premiumプランへの誘導バナー
 * Freeユーザー・未ログインユーザーに表示
 */
export function ProPromoBanner({ aboveTabNav = false }: ProPromoBannerProps) {
  return (
    <div
      className={`fixed left-0 right-0 z-40 border-t border-slate-200 bg-linear-to-r from-slate-50 to-slate-100 shadow-lg ${
        aboveTabNav ? "bottom-14" : "bottom-0"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className="text-sm text-slate-600">広告なしでもっと快適に</span>
        </div>
        <Link
          href="/pricing"
          className="rounded-full bg-slate-800 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          Premium
        </Link>
      </div>
    </div>
  );
}
