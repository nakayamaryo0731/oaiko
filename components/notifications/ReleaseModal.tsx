"use client";

import { X } from "lucide-react";
import type { Release } from "@/lib/releases";

type ReleaseModalProps = {
  release: Release;
  onClose: () => void;
  onBack: () => void;
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function ReleaseModal({ release, onClose, onBack }: ReleaseModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl p-5 max-h-[90dvh] overflow-y-auto shadow-xl">
        <div className="flex items-start justify-between mb-3">
          <time className="text-xs text-slate-400">
            {formatDate(release.publishedAt)}
          </time>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -m-2 text-slate-400 hover:text-slate-600"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          {release.title}
        </h2>
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
          {release.body}
        </p>

        <button
          type="button"
          onClick={onBack}
          className="mt-5 w-full py-3 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
        >
          ← 一覧に戻る
        </button>
      </div>
    </div>
  );
}
