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
import { MemberColorDot } from "@/components/ui/MemberColorDot";
import {
  SplitMethodSelector,
  type SplitMethod,
} from "@/components/expenses/SplitMethodSelector";
import { Pause, Play, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

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
  amount?: number;
  amountMode: "fixed" | "variable";
  categoryId: Id<"categories">;
  paidBy: Id<"users">;
  dayOfMonth: number;
  title: string;
  memo?: string;
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

  const { open, handleOpenChange, isLoading, error, setError, execute } =
    useFormDialog({
      onReset: () => {
        setMode("list");
        setEditingTemplate(null);
      },
    });

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
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
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

          {(mode === "create" || mode === "edit") && (
            <RecurringExpenseForm
              groupId={groupId}
              categories={categories}
              members={members}
              memberColors={memberColors}
              template={mode === "edit" ? editingTemplate : null}
              isLoading={isLoading}
              error={error}
              setError={setError}
              execute={execute}
              onDone={() => {
                setMode("list");
                setEditingTemplate(null);
              }}
              onCancel={() => {
                setMode("list");
                setEditingTemplate(null);
                setError(null);
              }}
            />
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
          毎月{template.dayOfMonth}日 ·{" "}
          {template.amountMode === "fixed"
            ? `¥${(template.amount ?? 0).toLocaleString()}`
            : "変動（毎月入力）"}{" "}
          · {template.payerName}
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

function RecurringExpenseForm({
  groupId,
  categories,
  members,
  memberColors,
  template,
  isLoading,
  error,
  setError,
  execute,
  onDone,
  onCancel,
}: {
  groupId: Id<"groups">;
  categories: Category[];
  members: Member[];
  memberColors?: Record<string, string>;
  template: Template | null;
  isLoading: boolean;
  error: string | null;
  setError: (e: string | null) => void;
  execute: (
    fn: () => Promise<unknown>,
    opts?: { closeOnSuccess?: boolean },
  ) => Promise<{ success: boolean; error?: string }>;
  onDone: () => void;
  onCancel: () => void;
}) {
  const createTemplate = useMutation(api.recurringExpenses.create);
  const updateTemplate = useMutation(api.recurringExpenses.update);

  const me = members.find((m) => m.isMe);

  const [title, setTitle] = useState(template?.title ?? "");
  const [amountMode, setAmountMode] = useState<"fixed" | "variable">(
    template?.amountMode ?? "fixed",
  );
  const [amount, setAmount] = useState(
    template?.amount !== undefined ? String(template.amount) : "",
  );
  const [categoryId, setCategoryId] = useState<Id<"categories"> | "">(
    template?.categoryId ?? "",
  );
  const [paidBy, setPaidBy] = useState<Id<"users"> | null>(
    template?.paidBy ?? me?.userId ?? null,
  );
  const [dayOfMonth, setDayOfMonth] = useState(template?.dayOfMonth ?? 25);
  const [memo, setMemo] = useState(template?.memo ?? "");

  const initialSplit = template?.splitDetails;
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(
    initialSplit?.method ?? "equal",
  );
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<Id<"users">>>(
    () => {
      if (initialSplit?.method === "equal" && initialSplit.memberIds) {
        return new Set(initialSplit.memberIds);
      }
      if (initialSplit?.method === "ratio") {
        return new Set(initialSplit.ratios.map((r) => r.userId));
      }
      if (initialSplit?.method === "amount") {
        return new Set(initialSplit.amounts.map((a) => a.userId));
      }
      return new Set(members.map((m) => m.userId));
    },
  );
  const [ratios, setRatios] = useState<Map<Id<"users">, number>>(() => {
    if (initialSplit?.method === "ratio") {
      return new Map(initialSplit.ratios.map((r) => [r.userId, r.ratio]));
    }
    return new Map();
  });
  const [amounts, setAmounts] = useState<Map<Id<"users">, number>>(() => {
    if (initialSplit?.method === "amount") {
      return new Map(initialSplit.amounts.map((a) => [a.userId, a.amount]));
    }
    return new Map();
  });
  const [bearerId, setBearerId] = useState<Id<"users"> | null>(
    initialSplit?.method === "full" ? initialSplit.bearerId : null,
  );

  const handleMethodChange = (method: SplitMethod) => {
    if (amountMode === "variable" && method === "amount") {
      setError("変動モードでは金額指定の分割は使用できません");
      return;
    }
    setError(null);
    setSplitMethod(method);
  };

  const handleAmountModeChange = (mode: "fixed" | "variable") => {
    setAmountMode(mode);
    if (mode === "variable" && splitMethod === "amount") {
      setSplitMethod("equal");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    if (!categoryId) {
      setError("カテゴリを選択してください");
      return;
    }
    if (!paidBy) {
      setError("支払者を選択してください");
      return;
    }

    const amountNum = parseInt(amount, 10);
    if (amountMode === "fixed" && (!amountNum || amountNum <= 0)) {
      setError("金額を入力してください");
      return;
    }

    if (selectedMemberIds.size === 0) {
      setError("負担するメンバーを1人以上選択してください");
      return;
    }
    const selectedMemberIdArray = Array.from(selectedMemberIds);

    let splitDetails: SplitDetails;
    if (splitMethod === "equal") {
      splitDetails = { method: "equal", memberIds: selectedMemberIdArray };
    } else if (splitMethod === "ratio") {
      const selectedRatios = Array.from(ratios.entries())
        .filter(([userId]) => selectedMemberIds.has(userId))
        .map(([userId, ratio]) => ({ userId, ratio }));
      const totalRatio = selectedRatios.reduce((sum, r) => sum + r.ratio, 0);
      if (totalRatio !== 100) {
        setError("割合の合計を100%にしてください");
        return;
      }
      splitDetails = { method: "ratio", ratios: selectedRatios };
    } else if (splitMethod === "amount") {
      const selectedAmounts = Array.from(amounts.entries())
        .filter(([userId]) => selectedMemberIds.has(userId))
        .map(([userId, amt]) => ({ userId, amount: amt }));
      const totalAmounts = selectedAmounts.reduce((s, a) => s + a.amount, 0);
      if (totalAmounts !== amountNum) {
        setError("金額の合計を支出金額と一致させてください");
        return;
      }
      splitDetails = { method: "amount", amounts: selectedAmounts };
    } else {
      if (!bearerId || !selectedMemberIds.has(bearerId)) {
        setError("全額負担者を選択してください");
        return;
      }
      splitDetails = { method: "full", bearerId };
    }

    const payload = {
      amount: amountNum > 0 ? amountNum : undefined,
      amountMode,
      categoryId,
      paidBy,
      dayOfMonth,
      title: title.trim(),
      memo: memo.trim() || undefined,
      splitDetails,
    };

    const result = await execute(
      () =>
        template
          ? updateTemplate({ recurringExpenseId: template._id, ...payload })
          : createTemplate({ groupId, ...payload }),
      { closeOnSuccess: false },
    );
    if (result.success) {
      if (!template) {
        trackEvent("create_recurring_expense", { amount_mode: amountMode });
      }
      onDone();
    }
  };

  return (
    <div className="space-y-4">
      <ErrorAlert message={error} className="p-2 rounded border-0" />

      {/* タイトル */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="家賃、Netflix など"
          className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg"
          maxLength={50}
        />
      </div>

      {/* 金額モード */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">金額</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleAmountModeChange("fixed")}
            className={`flex-1 py-2 text-sm font-medium rounded-md border transition-colors ${
              amountMode === "fixed"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            毎月同じ
          </button>
          <button
            type="button"
            onClick={() => handleAmountModeChange("variable")}
            className={`flex-1 py-2 text-sm font-medium rounded-md border transition-colors ${
              amountMode === "variable"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            毎月変わる
          </button>
        </div>
        {amountMode === "fixed" ? (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-sm text-slate-500">¥</span>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="85000"
              className="w-full h-10 px-3 text-right text-sm border border-slate-300 rounded-lg"
              min={1}
            />
          </div>
        ) : (
          <p className="text-xs text-slate-500 mt-1.5">
            実行日に金額の確認カードが表示され、入力すると記録されます
          </p>
        )}
      </div>

      {/* 実行日 */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">
          実行日（毎月）
        </label>
        <select
          value={dayOfMonth}
          onChange={(e) => setDayOfMonth(Number(e.target.value))}
          className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white"
        >
          {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {d}日
            </option>
          ))}
        </select>
      </div>

      {/* カテゴリ */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">カテゴリ</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value as Id<"categories">)}
          className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white"
        >
          <option value="">選択してください</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 支払者 */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">支払者</label>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <button
              key={m.userId}
              type="button"
              onClick={() => setPaidBy(m.userId)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                paidBy === m.userId
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              <MemberColorDot color={memberColors?.[m.userId]} />
              {m.displayName}
              {m.isMe && " (自分)"}
            </button>
          ))}
        </div>
      </div>

      {/* 負担方法 */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">負担方法</label>
        <SplitMethodSelector
          method={splitMethod}
          onMethodChange={handleMethodChange}
          members={members}
          selectedMemberIds={selectedMemberIds}
          onSelectedMemberIdsChange={setSelectedMemberIds}
          totalAmount={parseInt(amount, 10) || 0}
          ratios={ratios}
          onRatiosChange={setRatios}
          amounts={amounts}
          onAmountsChange={setAmounts}
          bearerId={bearerId}
          onBearerIdChange={setBearerId}
          isPremium
          memberColors={memberColors}
        />
      </div>

      {/* メモ */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">
          メモ（任意）
        </label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg"
          maxLength={200}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          キャンセル
        </Button>
        <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "保存中..." : template ? "更新" : "追加"}
        </Button>
      </div>
    </div>
  );
}
