"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ExpenseForm } from "./ExpenseForm";
import { DeleteExpenseDialog } from "./DeleteExpenseDialog";
import { X, Trash2 } from "lucide-react";
import { DEFAULT_ICON } from "@/lib/categoryIcons";
import { buildMemberColorMap } from "@/lib/userColors";
import { useEscapeKey } from "@/hooks";

type ExpenseEditModalProps = {
  expenseId: Id<"expenses">;
  groupId: Id<"groups">;
  onClose: () => void;
};

export function ExpenseEditModal({
  expenseId,
  groupId,
  onClose,
}: ExpenseEditModalProps) {
  const expense = useQuery(api.expenses.getById, { expenseId });
  const detail = useQuery(api.groups.getDetail, { groupId });
  const { isAuthenticated } = useConvexAuth();
  const subscription = useQuery(
    api.subscriptions.getMySubscription,
    isAuthenticated ? {} : "skip",
  );
  const removeExpense = useMutation(api.expenses.remove);

  const isPremium = subscription?.plan === "premium";
  const memberColors = useMemo(
    () => (detail ? buildMemberColorMap(detail.members) : {}),
    [detail],
  );

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 内側の削除ダイアログ表示中は Esc を内側に任せる
  useEscapeKey(onClose, !showDeleteDialog);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await removeExpense({ expenseId });
      onClose();
    } catch {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const isLoading = expense === undefined || detail === undefined;

  const categoryId = expense?.category?._id ?? detail?.categories[0]?._id;
  const paidBy = expense?.payer?._id ?? detail?.members[0]?.userId;

  const initialData =
    expense && expense !== null && categoryId && paidBy
      ? {
          expenseId: expense._id,
          amount: expense.amount,
          categoryId,
          paidBy,
          date: expense.date,
          title: expense.title,
          memo: expense.memo,
          splitMethod: expense.splitMethod as
            | "equal"
            | "ratio"
            | "amount"
            | "full",
          ratios:
            expense.splitMethod === "ratio"
              ? (() => {
                  const rawRatios = expense.splits.map((s) => ({
                    userId: s.userId,
                    ratio: Math.round((s.amount / expense.amount) * 100),
                  }));
                  const total = rawRatios.reduce((sum, r) => sum + r.ratio, 0);
                  if (total !== 100 && rawRatios.length > 0) {
                    rawRatios[0].ratio += 100 - total;
                  }
                  return rawRatios;
                })()
              : undefined,
          amounts:
            expense.splitMethod === "amount"
              ? expense.splits.map((s) => ({
                  userId: s.userId,
                  amount: s.amount,
                }))
              : undefined,
          bearerId:
            expense.splitMethod === "full"
              ? expense.splits.find((s) => s.amount === expense.amount)?.userId
              : undefined,
          splits: expense.splits.map((s) => ({
            userId: s.userId,
            amount: s.amount,
          })),
          tagIds: expense.tags?.map((t) => t._id),
        }
      : undefined;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white rounded-2xl p-4 max-h-[95dvh] overflow-y-auto overflow-x-hidden shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">支出を編集</h3>
            <div className="flex items-center gap-1">
              {expense && expense !== null && (
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="削除"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600"
                aria-label="閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            {isLoading ? (
              <div className="space-y-6 py-2">
                <div className="text-center py-4">
                  <div className="h-14 w-48 mx-auto bg-slate-100 rounded-xl animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-12 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="w-36 h-12 bg-slate-100 rounded-xl animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-10 w-24 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-10 w-24 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            ) : expense === null ? (
              <div className="text-center py-12 text-slate-500">
                支出が見つかりません
              </div>
            ) : (
              detail &&
              initialData && (
                <ExpenseForm
                  groupId={groupId}
                  categories={detail.categories}
                  members={detail.members.map((m) => ({
                    userId: m.userId,
                    displayName: m.displayName,
                    isMe: m.isMe,
                  }))}
                  mode="edit"
                  initialData={initialData}
                  isPremium={isPremium}
                  linkedShoppingItems={expense.linkedShoppingItems}
                  memberColors={memberColors}
                  onClose={onClose}
                />
              )
            )}
          </div>
        </div>
      </div>

      {expense && expense !== null && (
        <DeleteExpenseDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          expense={{
            categoryIcon: expense.category?.icon ?? DEFAULT_ICON,
            categoryName: expense.category?.name ?? "カテゴリなし",
            amount: expense.amount,
            date: expense.date,
          }}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}
