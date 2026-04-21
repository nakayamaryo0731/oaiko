"use client";

import { formatPeriod } from "@/lib/formatters";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PeriodNavigatorProps = {
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  onPrevious: () => void;
  onNext: () => void;
};

export function PeriodNavigator({
  year,
  month,
  startDate,
  endDate,
  onPrevious,
  onNext,
}: PeriodNavigatorProps) {
  return (
    <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
      <button
        onClick={onPrevious}
        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        aria-label="前の月へ"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="text-center">
        <div className="font-medium text-slate-800">
          {year}年{month}月分
        </div>
        <div className="text-sm text-slate-500">
          {formatPeriod(startDate, endDate)}
        </div>
      </div>

      <button
        onClick={onNext}
        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        aria-label="次の月へ"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
