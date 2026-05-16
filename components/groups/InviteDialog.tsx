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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useFormDialog } from "@/hooks/useFormDialog";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { trackEvent } from "@/lib/analytics";
import { InviteShareActions } from "./InviteShareActions";

type InviteDialogProps = {
  groupId: Id<"groups">;
  groupName: string;
};

export function InviteDialog({ groupId, groupName }: InviteDialogProps) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const { open, handleOpenChange, isLoading, error, execute } = useFormDialog({
    onReset: () => {
      setInviteUrl(null);
    },
  });

  const createInvitation = useMutation(api.groups.createInvitation);

  const handleCreateInvite = async () => {
    const result = await execute(
      async () => {
        const invitation = await createInvitation({ groupId });
        const baseUrl = window.location.origin;
        return `${baseUrl}/invite/${invitation.token}`;
      },
      { closeOnSuccess: false },
    );

    if (result.success && result.data) {
      setInviteUrl(result.data);
      trackEvent("invite_sent", { source: "dialog" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1 transition-colors">
          <UserPlus className="h-4 w-4" />
          招待
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>メンバーを招待</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <ErrorAlert message={error} className="rounded-md" />

          {!inviteUrl ? (
            <div className="text-center py-4">
              <p className="text-sm text-slate-600 mb-4">
                招待リンクを作成して、メンバーを招待できます。
                <br />
                リンクの有効期限は7日間です。
              </p>
              <Button onClick={handleCreateInvite} disabled={isLoading}>
                {isLoading ? "作成中..." : "招待リンクを作成"}
              </Button>
            </div>
          ) : (
            <InviteShareActions inviteUrl={inviteUrl} groupName={groupName} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
