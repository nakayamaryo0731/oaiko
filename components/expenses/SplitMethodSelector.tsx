"use client";

import type { Id } from "@/convex/_generated/dataModel";

export type SplitMethod = "equal" | "ratio" | "amount" | "full";

export type SplitDetails =
  | { method: "equal" }
  | { method: "ratio"; ratios: { userId: Id<"users">; ratio: number }[] }
  | { method: "amount"; amounts: { userId: Id<"users">; amount: number }[] }
  | { method: "full"; bearerId: Id<"users"> };

type Member = {
  userId: Id<"users">;
  displayName: string;
  isMe: boolean;
};

type SplitMethodSelectorProps = {
  method: SplitMethod;
  onMethodChange: (method: SplitMethod) => void;
  members: Member[];
  totalAmount: number;
  ratios: Map<Id<"users">, number>;
  onRatiosChange: (ratios: Map<Id<"users">, number>) => void;
  amounts: Map<Id<"users">, number>;
  onAmountsChange: (amounts: Map<Id<"users">, number>) => void;
  bearerId: Id<"users"> | null;
  onBearerIdChange: (bearerId: Id<"users">) => void;
};

const methodLabels: Record<SplitMethod, string> = {
  equal: "均等",
  ratio: "割合",
  amount: "金額",
  full: "全額",
};

export function SplitMethodSelector({
  method,
  onMethodChange,
  members,
  totalAmount,
  ratios,
  onRatiosChange,
  amounts,
  onAmountsChange,
  bearerId,
  onBearerIdChange,
}: SplitMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["equal", "ratio", "amount", "full"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md border transition-colors ${
              method === m
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
            }`}
            onClick={() => onMethodChange(m)}
          >
            {methodLabels[m]}
          </button>
        ))}
      </div>

      {method === "ratio" && (
        <RatioInput
          members={members}
          ratios={ratios}
          onRatiosChange={onRatiosChange}
        />
      )}

      {method === "amount" && (
        <AmountInput
          members={members}
          totalAmount={totalAmount}
          amounts={amounts}
          onAmountsChange={onAmountsChange}
        />
      )}

      {method === "full" && (
        <FullInput
          members={members}
          bearerId={bearerId}
          onBearerIdChange={onBearerIdChange}
        />
      )}
    </div>
  );
}

function RatioInput({
  members,
  ratios,
  onRatiosChange,
}: {
  members: Member[];
  ratios: Map<Id<"users">, number>;
  onRatiosChange: (ratios: Map<Id<"users">, number>) => void;
}) {
  const total = Array.from(ratios.values()).reduce((sum, v) => sum + v, 0);
  const isValid = total === 100;

  const handleRatioChange = (userId: Id<"users">, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    const newRatios = new Map(ratios);
    newRatios.set(userId, Math.max(0, Math.min(100, numValue)));
    onRatiosChange(newRatios);
  };

  return (
    <div className="space-y-3 p-3 bg-slate-50 rounded-md">
      {members.map((member) => (
        <div key={member.userId} className="flex items-center gap-3">
          <span className="flex-1 text-sm">{member.displayName}</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              inputMode="numeric"
              value={ratios.get(member.userId) ?? 0}
              onChange={(e) => handleRatioChange(member.userId, e.target.value)}
              className="w-16 h-8 px-2 text-right text-sm border border-slate-300 rounded-md"
              min={0}
              max={100}
            />
            <span className="text-sm text-slate-500">%</span>
          </div>
        </div>
      ))}
      <div
        className={`text-sm text-right ${isValid ? "text-green-600" : "text-red-600"}`}
      >
        合計: {total}%{!isValid && " (100%にしてください)"}
      </div>
    </div>
  );
}

function AmountInput({
  members,
  totalAmount,
  amounts,
  onAmountsChange,
}: {
  members: Member[];
  totalAmount: number;
  amounts: Map<Id<"users">, number>;
  onAmountsChange: (amounts: Map<Id<"users">, number>) => void;
}) {
  const total = Array.from(amounts.values()).reduce((sum, v) => sum + v, 0);
  const remaining = totalAmount - total;
  const isValid = remaining === 0;

  const handleAmountChange = (userId: Id<"users">, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    const newAmounts = new Map(amounts);
    newAmounts.set(userId, Math.max(0, numValue));
    onAmountsChange(newAmounts);
  };

  return (
    <div className="space-y-3 p-3 bg-slate-50 rounded-md">
      {members.map((member) => (
        <div key={member.userId} className="flex items-center gap-3">
          <span className="flex-1 text-sm">{member.displayName}</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-slate-500">¥</span>
            <input
              type="number"
              inputMode="numeric"
              value={amounts.get(member.userId) ?? 0}
              onChange={(e) =>
                handleAmountChange(member.userId, e.target.value)
              }
              className="w-24 h-8 px-2 text-right text-sm border border-slate-300 rounded-md"
              min={0}
            />
          </div>
        </div>
      ))}
      <div
        className={`text-sm text-right ${isValid ? "text-green-600" : "text-red-600"}`}
      >
        合計: ¥{total.toLocaleString()} / ¥{totalAmount.toLocaleString()}
        {remaining !== 0 && ` (残り: ¥${remaining.toLocaleString()})`}
      </div>
    </div>
  );
}

function FullInput({
  members,
  bearerId,
  onBearerIdChange,
}: {
  members: Member[];
  bearerId: Id<"users"> | null;
  onBearerIdChange: (bearerId: Id<"users">) => void;
}) {
  return (
    <div className="space-y-2 p-3 bg-slate-50 rounded-md">
      <p className="text-sm text-slate-600">誰が全額負担しますか？</p>
      {members.map((member) => (
        <label
          key={member.userId}
          className="flex items-center gap-3 cursor-pointer"
        >
          <input
            type="radio"
            name="bearer"
            checked={bearerId === member.userId}
            onChange={() => onBearerIdChange(member.userId)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm">{member.displayName}</span>
        </label>
      ))}
      {bearerId === null && (
        <p className="text-sm text-red-600">負担者を選択してください</p>
      )}
    </div>
  );
}
