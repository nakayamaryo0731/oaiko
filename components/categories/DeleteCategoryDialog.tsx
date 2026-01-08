"use client";

import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

type DeleteCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: {
    icon: string;
    name: string;
  };
  onConfirm: () => void;
  isDeleting: boolean;
};

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  onConfirm,
  isDeleting,
}: DeleteCategoryDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="カテゴリを削除"
      description="このカテゴリを削除してもよろしいですか？"
      onConfirm={onConfirm}
      isLoading={isDeleting}
      confirmLabel="削除する"
    >
      <div className="py-4">
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
          <span className="text-xl">{category.icon}</span>
          <span className="font-medium">{category.name}</span>
        </div>
      </div>
    </ConfirmationDialog>
  );
}
