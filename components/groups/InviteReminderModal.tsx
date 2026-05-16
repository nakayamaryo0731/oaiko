"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { trackEvent } from "@/lib/analytics";
import { InviteShareActions } from "./InviteShareActions";

const OPEN_DELAY_MS = 700;

type Props = {
  groupId: Id<"groups">;
  groupName: string;
  /** 表示してよい状態か（オーナー + メンバー1 + 未dismiss + 有効招待なし + PWA完了 等） */
  shouldShow: boolean;
};

export function InviteReminderModal({ groupId, groupName, shouldShow }: Props) {
  const [open, setOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInvitation = useMutation(api.groups.createInvitation);
  const dismissInviteReminder = useMutation(api.groups.dismissInviteReminder);

  useEffect(() => {
    if (hasShown) return;
    if (!shouldShow) return;

    const timer = setTimeout(() => {
      setOpen(true);
      setHasShown(true);
      trackEvent("invite_reminder_shown");
    }, OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [shouldShow, hasShown]);

  const handleCreateInvite = async () => {
    setIsCreating(true);
    setError(null);
    try {
      trackEvent("invite_reminder_cta_clicked");
      const invitation = await createInvitation({ groupId });
      const baseUrl = window.location.origin;
      setInviteUrl(`${baseUrl}/invite/${invitation.token}`);
      trackEvent("invite_sent", { source: "reminder" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDismiss = () => {
    setOpen(false);
    trackEvent("invite_reminder_dismissed");
    dismissInviteReminder({ groupId }).catch((err) => {
      console.error("Failed to dismiss invite reminder:", err);
    });
  };

  const handleOpenChange = (next: boolean) => {
    // ESC / backdrop で閉じたケースは「永久 dismiss」しない。
    // 永久 dismiss は明示的に「あとで」ボタンを押したとき（handleDismiss）のみ。
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>相棒を招待してみる？</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <ErrorAlert message={error} className="rounded-md" />

          {!inviteUrl ? (
            <>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pairbo
                は二人で使うと記録が共有できて、月末の精算も自動でできるアプリ。
                今のままだと一人用メモになってます。相棒に招待リンクを送ってみよう。
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDismiss}
                  disabled={isCreating}
                >
                  あとで
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateInvite}
                  disabled={isCreating}
                >
                  {isCreating ? "作成中..." : "招待リンクを作る"}
                </Button>
              </div>
            </>
          ) : (
            <InviteShareActions inviteUrl={inviteUrl} groupName={groupName} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
