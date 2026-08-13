"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { useFormDialog } from "@/hooks/useFormDialog";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { DEFAULT_ICON } from "@/lib/categoryIcons";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Pause, Play, Pencil, Trash2, AlertTriangle } from "lucide-react";

type Category = {
  _id: Id<"categories">;
  name: string;
  icon: string;
};

type Member = {
  userId: Id<"users">;
  displayName: string;
  isMe: boolean;
};

type SplitDetails =
  | { method: "equal"; memberIds?: Id<"users">[] }
  | { method: "ratio"; ratios: { userId: Id<"users">; ratio: number }[] }
  | { method: "amount"; amounts: { userId: Id<"users">; amount: number }[] }
  | { method: "full"; bearerId: Id<"users"> };

type Template = {
  _id: Id<"recurringExpenses">;
  amount: number;
  categoryId: Id<"categories">;
  paidBy: Id<"users">;
  dayOfMonth: number;
  title: string;
  splitDetails: SplitDetails;
  pausedAt?: number;
  category: { name: string; icon: string } | null;
  payerName: string;
  payerLeft: boolean;
};

type RecurringExpenseManagerProps = {
  groupId: Id<"groups">;
  categories: Category[];
  members: Member[];
  memberColors?: Record<string, string>;
};

/** テンプレートをExpenseFormのinitialDataに変換する */
function toInitialData(template: Template) {
  const { splitDetails } = template;
  return {
    recurringExpenseId: template._id,
    amount: template.amount,
    categoryId: template.categoryId,
    paidBy: template.paidBy,
    dayOfMonth: template.dayOfMonth,
    title: template.title,
    splitMethod: splitDetails.method,
    ratios: splitDetails.method === "ratio" ? splitDetails.ratios : undefined,
    amounts:
      splitDetails.method === "amount" ? splitDetails.amounts : undefined,
    bearerId:
      splitDetails.method === "full" ? splitDetails.bearerId : undefined,
    selectedMemberIds:
      splitDetails.method === "equal"
        ? splitDetails.memberIds
        : splitDetails.method === "ratio"
          ? splitDetails.ratios.map((r) => r.userId)
          : splitDetails.method === "amount"
            ? splitDetails.amounts.map((a) => a.userId)
            : undefined,
  };
}

export function RecurringExpenseManager({
  groupId,
  categories,
  members,
  memberColors,
}: RecurringExpenseManagerProps) {
  const templates = useQuery(api.recurringExpenses.list, { groupId });
  const removeTemplate = useMutation(api.recurringExpenses.remove);
  const setPaused = useMutation(api.recurringExpenses.setPaused);

  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(
    null,
  );

  const { open, handleOpenChange, isLoading, error, execute } = useFormDialog({
    onReset: () => {
      setMode("list");
      setEditingTemplate(null);
    },
  });

  const backToList = () => {
    setMode("list");
    setEditingTemplate(null);
  };

  const handleDelete = async () => {
    if (!deletingTemplate) return;
    const result = await execute(
      () => removeTemplate({ recurringExpenseId: deletingTemplate._id }),
      { closeOnSuccess: false },
    );
    if (result.success) {
      setDeletingTemplate(null);
    }
  };

  const handleTogglePaused = async (template: Template) => {
    await execute(
      () =>
        setPaused({
          recurringExpenseId: template._id,
          paused: template.pausedAt === undefined,
        }),
      { closeOnSuccess: false },
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            定期支出
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {mode === "list" && "定期支出"}
              {mode === "create" && "定期支出を追加"}
              {mode === "edit" && "定期支出を編集"}
            </DialogTitle>
          </DialogHeader>

          {mode === "list" && (
            <div className="space-y-4">
              <ErrorAlert message={error} className="p-2 rounded border-0" />

              {templates && templates.length > 0 ? (
                <div className="space-y-1">
                  {templates.map((template) => (
                    <TemplateItem
                      key={template._id}
                      template={template}
                      isLoading={isLoading}
                      onEdit={() => {
                        setEditingTemplate(template);
                        setMode("edit");
                      }}
                      onDelete={() => setDeletingTemplate(template)}
                      onTogglePaused={() => handleTogglePaused(template)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  家賃やサブスクなど、毎月の支出を自動で記録できます
                </p>
              )}

              <Button
                className="w-full"
                variant="outline"
                onClick={() => setMode("create")}
              >
                + 定期支出を追加
              </Button>
            </div>
          )}

          {/* min-w-0: gridの子はmin-width:autoのため、横スクロールチップが幅を押し広げるのを防ぐ */}
          {mode === "create" && (
            <div className="min-w-0">
              <ExpenseForm
                variant="recurring"
                groupId={groupId}
                categories={categories}
                members={members}
                memberColors={memberColors}
                isPremium
                onClose={backToList}
                autoFocusAmount
              />
            </div>
          )}

          {mode === "edit" && editingTemplate && (
            <div className="min-w-0">
              <ExpenseForm
                variant="recurring"
                mode="edit"
                groupId={groupId}
                categories={categories}
                members={members}
                memberColors={memberColors}
                isPremium
                initialData={toInitialData(editingTemplate)}
                onClose={backToList}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!deletingTemplate}
        onOpenChange={(open) => {
          if (!open) setDeletingTemplate(null);
        }}
        title="定期支出を削除"
        description={`「${deletingTemplate?.title}」を削除しますか？作成済みの支出は残ります。`}
        onConfirm={handleDelete}
        isLoading={isLoading}
        variant="destructive"
      />
    </>
  );
}

function TemplateItem({
  template,
  isLoading,
  onEdit,
  onDelete,
  onTogglePaused,
}: {
  template: Template;
  isLoading: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePaused: () => void;
}) {
  const isPaused = template.pausedAt !== undefined;

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg border border-slate-200 ${isPaused ? "opacity-60" : ""}`}
    >
      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
        <CategoryIcon
          name={template.category?.icon ?? DEFAULT_ICON}
          size="sm"
          className="text-slate-600"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          {template.title}
          {isPaused && (
            <span className="ml-1.5 text-xs text-slate-400">停止中</span>
          )}
        </p>
        <p className="text-xs text-slate-500">
          毎月{template.dayOfMonth}日 · ¥{template.amount.toLocaleString()} ·{" "}
          {template.payerName}
        </p>
        {template.payerLeft && (
          <p className="flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="w-3 h-3" />
            支払者がグループにいません
          </p>
        )}
      </div>
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onTogglePaused}
          disabled={isLoading}
          aria-label={isPaused ? "再開" : "一時停止"}
          title={isPaused ? "再開" : "一時停止"}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          {isPaused ? (
            <Play className="w-4 h-4" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
        </button>
        <button
          type="button"
          onClick={onEdit}
          aria-label="編集"
          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="削除"
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
