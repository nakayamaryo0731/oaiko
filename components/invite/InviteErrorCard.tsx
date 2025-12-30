"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export type InviteError = "invalid_token" | "expired" | "already_used";

interface InviteErrorCardProps {
  error: InviteError;
}

const errorMessages: Record<InviteError, { title: string; details: string[] }> =
  {
    invalid_token: {
      title: "招待リンクが無効です",
      details: ["リンクが間違っている", "招待が取り消された"],
    },
    expired: {
      title: "招待リンクの有効期限が切れています",
      details: [
        "招待リンクは7日間有効です",
        "新しい招待リンクを依頼してください",
      ],
    },
    already_used: {
      title: "この招待リンクは既に使用されています",
      details: [
        "招待リンクは1回限り有効です",
        "新しい招待リンクを依頼してください",
      ],
    },
  };

export function InviteErrorCard({ error }: InviteErrorCardProps) {
  const { title, details } = errorMessages[error];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 w-full max-w-sm mx-auto">
      {/* アイコン */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-500"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>
      </div>

      {/* エラータイトル */}
      <h1 className="text-xl font-semibold text-center text-slate-800 mb-4">
        {title}
      </h1>

      {/* エラー詳細 */}
      <ul className="text-slate-600 space-y-1 mb-6">
        {details.map((detail, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-slate-400">・</span>
            <span>{detail}</span>
          </li>
        ))}
      </ul>

      {/* 区切り線 */}
      <div className="border-t border-slate-200 my-4" />

      {/* ボタン */}
      <Link href="/">
        <Button variant="outline" className="w-full" size="lg">
          ホームに戻る
        </Button>
      </Link>
    </div>
  );
}
