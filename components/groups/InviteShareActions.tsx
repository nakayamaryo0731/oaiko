"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { buildInviteShareText } from "@/lib/inviteShareTemplate";

type InviteShareActionsProps = {
  inviteUrl: string;
  groupName: string;
};

export function InviteShareActions({
  inviteUrl,
  groupName,
}: InviteShareActionsProps) {
  const [copiedKind, setCopiedKind] = useState<"text" | "url" | null>(null);

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(textArea);
      }
      return true;
    }
  };

  const flashCopied = (kind: "text" | "url") => {
    setCopiedKind(kind);
    setTimeout(() => setCopiedKind(null), 2000);
  };

  const handleCopyText = async () => {
    const text = buildInviteShareText(groupName, inviteUrl);
    if (await copyToClipboard(text)) {
      trackEvent("invite_share_with_template", { method: "copy" });
      flashCopied("text");
    }
  };

  const handleCopyUrl = async () => {
    if (await copyToClipboard(inviteUrl)) {
      trackEvent("invite_share_url_only", { method: "copy" });
      flashCopied("url");
    }
  };

  const handleShare = async () => {
    const text = buildInviteShareText(groupName, inviteUrl);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${groupName}への招待`,
          text,
        });
        trackEvent("invite_share_with_template", { method: "native_share" });
      } catch {
        // ユーザーキャンセル時は何もしない
      }
    } else {
      await handleCopyText();
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
        <p className="text-xs text-slate-500 mb-1">招待リンク</p>
        <p className="text-sm text-slate-800 break-all font-mono">
          {inviteUrl}
        </p>
      </div>

      <Button className="w-full" onClick={handleShare}>
        シェア（文面ごと）
      </Button>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleCopyText}
        >
          {copiedKind === "text" ? "コピーしました!" : "文面ごとコピー"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleCopyUrl}
        >
          {copiedKind === "url" ? "コピーしました!" : "URLのみ"}
        </Button>
      </div>

      <p className="text-xs text-slate-500 text-center">有効期限: 7日間</p>
    </div>
  );
}
