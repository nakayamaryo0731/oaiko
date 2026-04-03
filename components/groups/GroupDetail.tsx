"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
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
      {/* 期間ナビ（sticky: ヘッダーの下に固定） */}
      <div className="sticky top-14 z-10 bg-slate-50 px-4 py-2">
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

      {/* 支出一覧 */}
      <div className="px-4 pb-52 scrollbar-hide">
        <PeriodExpenseList
          groupId={group._id}
          year={displayYear}
          month={displayMonth}
          memberColors={memberColors}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      </div>

      {/* 精算カード（タブナビの上に固定） */}
      <div className="fixed bottom-14 left-0 right-0 z-10 bg-slate-50 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-lg mx-auto px-4 py-2">
          <SettlementPreview
            groupId={group._id}
            year={displayYear}
            month={displayMonth}
            compact
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
