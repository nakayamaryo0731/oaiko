"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";

interface InvitationInfo {
  groupId: Id<"groups">;
  groupName: string;
  inviterName: string;
  memberCount: number;
  expiresAt: number;
}

interface InviteLoginCardProps {
  token: string;
  invitation: InvitationInfo;
}

export function InviteLoginCard({ token, invitation }: InviteLoginCardProps) {
  // ログイン後に戻ってくるためのURL
  const redirectUrl = encodeURIComponent(`/invite/${token}`);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 w-full max-w-sm mx-auto">
      {/* アイコン */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
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
            className="text-slate-600"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
      </div>

      {/* グループ名 */}
      <h1 className="text-xl font-semibold text-center text-slate-800 mb-1">
        「{invitation.groupName}」
      </h1>
      <p className="text-center text-slate-600 mb-6">への招待</p>

      {/* 区切り線 */}
      <div className="border-t border-slate-200 my-4" />

      {/* ログイン誘導メッセージ */}
      <div className="text-center text-slate-600 mb-6">
        <p>グループに参加するには</p>
        <p>ログインが必要です</p>
      </div>

      {/* 区切り線 */}
      <div className="border-t border-slate-200 my-4" />

      {/* ボタン */}
      <div className="space-y-3">
        <Link href={`/sign-in?redirect_url=${redirectUrl}`}>
          <Button className="w-full" size="lg">
            ログインして参加
          </Button>
        </Link>
        <p className="text-center text-sm text-slate-500">
          アカウントをお持ちでない方は
        </p>
        <Link href={`/sign-up?redirect_url=${redirectUrl}`}>
          <Button variant="outline" className="w-full" size="lg">
            新規登録
          </Button>
        </Link>
      </div>
    </div>
  );
}
