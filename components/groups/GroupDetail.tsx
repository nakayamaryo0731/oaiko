"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { usePeriodNavigation } from "@/hooks";
import { PeriodExpenseList, DeleteExpenseDialog } from "@/components/expenses";
import { SettlementPreview, PeriodNavigator } from "@/components/settlements";
import { FAB } from "@/components/ui/FAB";
import { Plus } from "lucide-react";
import { buildMemberColorMap } from "@/lib/userColors";

type Member = {
  userId: Id<"users">;
  color?: string;
  joinedAt: number;
};

type GroupDetailProps = {
  group: {
    _id: Id<"groups">;
    name: string;
    description?: string;
    closingDay: number;
  };
  members: Member[];
};

type ExpenseToDelete = {
  _id: Id<"expenses">;
  amount: number;
  date: string;
  categoryIcon: string;
  categoryName: string;
};

export function GroupDetail({ group, members }: GroupDetailProps) {
  const router = useRouter();
  const removeExpense = useMutation(api.expenses.remove);

  // 期間ナビゲーション
  const {
    year: displayYear,
    month: displayMonth,
    goToPreviousMonth,
    goToNextMonth,
    canGoNextMonth: canGoNext,
    period,
  } = usePeriodNavigation({ closingDay: group.closingDay });

  const memberColors = useMemo(() => buildMemberColorMap(members), [members]);

  // 支出サマリー取得（固定表示用）
  const expenseData = useQuery(api.expenses.listByPeriod, {
    groupId: group._id,
    year: displayYear,
    month: displayMonth,
  });

  // 削除ダイアログ用の状態
  const [expenseToDelete, setExpenseToDelete] =
    useState<ExpenseToDelete | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (expenseId: Id<"expenses">) => {
    router.push(`/groups/${group._id}/expenses/${expenseId}`);
  };

  const handleDuplicate = (expenseId: Id<"expenses">) => {
    router.push(`/groups/${group._id}/expenses/new?from=${expenseId}`);
  };

  const handleDelete = (expense: ExpenseToDelete) => {
    setExpenseToDelete(expense);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;

    setIsDeleting(true);
    try {
      await removeExpense({ expenseId: expenseToDelete._id });
      setExpenseToDelete(null);
    } catch {
      // エラーはConvexが自動的にUIに反映
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* 固定ヘッダー（期間ナビ + サマリー） */}
      <div className="sticky top-14 z-10 bg-white border-b border-slate-200">
        <div className="px-4 py-4">
          <PeriodNavigator
            year={displayYear}
            month={displayMonth}
            startDate={period!.startDate}
            endDate={period!.endDate}
            onPrevious={goToPreviousMonth}
            onNext={goToNextMonth}
            canGoNext={canGoNext}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100">
          <span className="text-sm text-slate-600">
            {expenseData?.totalCount ?? 0}件の支出
          </span>
          <span className="text-lg font-semibold text-slate-800">
            ¥{(expenseData?.totalAmount ?? 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* コンテンツ領域 */}
      <div className="px-4 py-6 pb-40">
        <PeriodExpenseList
          groupId={group._id}
          year={displayYear}
          month={displayMonth}
          memberColors={memberColors}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />

        {/* 精算カード */}
        <div className="mt-6">
          <h2 className="font-medium text-slate-800 mb-3">今月の精算</h2>
          <SettlementPreview
            groupId={group._id}
            year={displayYear}
            month={displayMonth}
          />
        </div>
      </div>

      {/* 支出記録ボタン（FAB） */}
      <FAB
        href={`/groups/${group._id}/expenses/new`}
        icon={<Plus />}
        label="支出を記録"
      />

      {/* 削除確認ダイアログ */}
      {expenseToDelete && (
        <DeleteExpenseDialog
          open={!!expenseToDelete}
          onOpenChange={(open) => !open && setExpenseToDelete(null)}
          expense={{
            categoryIcon: expenseToDelete.categoryIcon,
            categoryName: expenseToDelete.categoryName,
            amount: expenseToDelete.amount,
            date: expenseToDelete.date,
          }}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
