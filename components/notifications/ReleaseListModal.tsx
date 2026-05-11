"use client";

import { X } from "lucide-react";
import type { Release } from "@/lib/releases";

type ReleaseListModalProps = {
  releases: Release[];
  onClose: () => void;
  /** リリースをクリックした時のコールバック */
  onItemClick: (release: Release) => void;
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function ReleaseListModal({
  releases,
  onClose,
  onItemClick,
}: ReleaseListModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl max-h-[90dvh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            お知らせ一覧
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto h-[340px]">
          <ul className="divide-y divide-slate-100">
            {releases.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onItemClick(r)}
                  className="w-full text-left px-5 py-3 h-[64px] hover:bg-slate-50 transition-colors"
                >
                  <time className="text-xs text-slate-400 block mb-1">
                    {formatDate(r.publishedAt)}
                  </time>
                  <h3 className="text-sm font-medium text-slate-800 truncate">
                    {r.title}
                  </h3>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
