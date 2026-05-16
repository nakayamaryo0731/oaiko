"use client";

import { useState } from "react";
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
import { UserPlus, ChevronRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { InviteShareActions } from "./InviteShareActions";

type Props = {
  groupId: Id<"groups">;
  groupName: string;
  /** 表示してよい状態か（オーナー + メンバー1 + 未dismiss + 有効招待なし） */
  shouldShow: boolean;
};

export function InviteCtaBanner({ groupId, groupName, shouldShow }: Props) {
  const [open, setOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInvitation = useMutation(api.groups.createInvitation);

  if (!shouldShow) return null;

  const handleOpen = () => {
    setInviteUrl(null);
    setError(null);
    setOpen(true);
    trackEvent("invite_reminder_cta_clicked", { source: "banner" });
  };

  const handleCreateInvite = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const invitation = await createInvitation({ groupId });
      const baseUrl = window.location.origin;
      setInviteUrl(`${baseUrl}/invite/${invitation.token}`);
      trackEvent("invite_sent", { source: "banner" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <UserPlus className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-900">
              相棒を招待してアプリを完成させよう
            </p>
            <p className="text-[11px] text-blue-700">
              二人で使うと割り勘・精算が自動になります
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-blue-400 shrink-0" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>相棒を招待</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <ErrorAlert message={error} className="rounded-md" />

            {!inviteUrl ? (
              <div className="text-center py-4">
                <p className="text-sm text-slate-600 mb-4">
                  招待リンクを作成して、相棒に共有しましょう。
                  <br />
                  リンクの有効期限は7日間です。
                </p>
                <Button onClick={handleCreateInvite} disabled={isCreating}>
                  {isCreating ? "作成中..." : "招待リンクを作る"}
                </Button>
              </div>
            ) : (
              <InviteShareActions inviteUrl={inviteUrl} groupName={groupName} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
