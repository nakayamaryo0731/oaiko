"use client";

import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

type DeleteGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: {
    name: string;
    memberCount: number;
  };
  onConfirm: () => void;
  isDeleting: boolean;
};

export function DeleteGroupDialog({
  open,
  onOpenChange,
  group,
  onConfirm,
  isDeleting,
}: DeleteGroupDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="グループを削除しますか？"
      description="この操作は取り消せません。グループ内の全データ（支出、精算履歴、買い物リスト等）が完全に削除されます。"
      onConfirm={onConfirm}
      isLoading={isDeleting}
      confirmLabel="削除する"
    >
      <div className="bg-slate-50 rounded-lg p-4 my-4">
        <div className="font-medium text-slate-800">{group.name}</div>
        <div className="text-sm text-slate-500 mt-1">
          メンバー {group.memberCount}人
        </div>
      </div>
    </ConfirmationDialog>
  );
}
