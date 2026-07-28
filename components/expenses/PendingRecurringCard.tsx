"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { DEFAULT_ICON } from "@/lib/categoryIcons";
import { RefreshCw, X } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

type PendingRecurringCardProps = {
  groupId: Id<"groups">;
};

/**
 * 変動額の定期支出の「金額確認待ち」カード
 * 金額を入力して確定すると支出が作成される
 */
export function PendingRecurringCard({ groupId }: PendingRecurringCardProps) {
  const pending = useQuery(api.recurringExpenses.listPending, { groupId });

  if (!pending || pending.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-3">
      {pending.map((item) => (
        <PendingItem key={item._id} item={item} />
      ))}
    </div>
  );
}

function PendingItem({
  item,
}: {
  item: {
    _id: Id<"recurringExpenses">;
    title: string;
    pendingMonth: string;
    previousAmount?: number;
    category: { name: string; icon: string } | null;
  };
}) {
  const confirmPending = useMutation(api.recurringExpenses.confirmPending);
  const skipPending = useMutation(api.recurringExpenses.skipPending);

  const [amount, setAmount] = useState(
    item.previousAmount !== undefined ? String(item.previousAmount) : "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [year, month] = item.pendingMonth.split("-");
  const monthLabel = `${Number(month)}月`;

  const handleConfirm = async () => {
    const amountNum = parseInt(amount, 10);
    if (!amountNum || amountNum <= 0) {
      setError("金額を入力してください");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await confirmPending({ recurringExpenseId: item._id, amount: amountNum });
    } catch (e) {
      setError(getErrorMessage(e, "記録に失敗しました"));
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await skipPending({ recurringExpenseId: item._id });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0">
          <CategoryIcon
            name={item.category?.icon ?? DEFAULT_ICON}
            size="sm"
            className="text-slate-600"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="text-sm font-medium text-slate-800 truncate">
              {item.title}
            </span>
          </div>
          <p className="text-xs text-amber-700">
            {year}年{monthLabel}分の金額を入力して記録
          </p>
        </div>
        <button
          type="button"
          onClick={handleSkip}
          disabled={isLoading}
          aria-label="今月はスキップ"
          title="今月はスキップ"
          className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex items-center gap-1 flex-1">
          <span className="text-sm text-slate-500">¥</span>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={
              item.previousAmount !== undefined
                ? String(item.previousAmount)
                : "金額"
            }
            className="w-full h-9 px-2 text-right text-sm border border-amber-300 rounded-md bg-white"
            min={1}
          />
        </div>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isLoading}
          className="h-9 px-4 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "記録中..." : "記録する"}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
