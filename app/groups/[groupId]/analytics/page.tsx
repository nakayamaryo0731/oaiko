"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft } from "lucide-react";
import { CategoryPieChart } from "@/components/analytics/CategoryPieChart";
import { MonthlyTrendChart } from "@/components/analytics/MonthlyTrendChart";
import { ChartSkeleton } from "@/components/analytics/ChartSkeleton";

type PageProps = {
  params: Promise<{ groupId: string }>;
};

type ViewType = "month" | "year";

/**
 * 今日が含まれる精算期間の年月を計算
 */
function getCurrentSettlementYearMonth(closingDay: number): {
  year: number;
  month: number;
} {
  const now = new Date();
  const today = now.getDate();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (today > closingDay) {
    if (currentMonth === 12) {
      return { year: currentYear + 1, month: 1 };
    }
    return { year: currentYear, month: currentMonth + 1 };
  }

  return { year: currentYear, month: currentMonth };
}

export default function AnalyticsPage({ params }: PageProps) {
  const { groupId } = use(params);
  const [viewType, setViewType] = useState<ViewType>("month");

  const group = useQuery(api.groups.getDetail, {
    groupId: groupId as Id<"groups">,
  });

  const currentPeriod = useMemo(() => {
    if (!group) return { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
    return getCurrentSettlementYearMonth(group.group.closingDay);
  }, [group]);

  // 月次データ
  const monthlyCategory = useQuery(
    api.analytics.getCategoryBreakdown,
    group
      ? {
          groupId: groupId as Id<"groups">,
          year: currentPeriod.year,
          month: currentPeriod.month,
        }
      : "skip"
  );

  const monthlyTrend = useQuery(
    api.analytics.getMonthlyTrend,
    group
      ? {
          groupId: groupId as Id<"groups">,
          year: currentPeriod.year,
          month: currentPeriod.month,
          months: 6,
        }
      : "skip"
  );

  // 年次データ
  const yearlyCategory = useQuery(
    api.analytics.getYearlyCategoryBreakdown,
    group
      ? {
          groupId: groupId as Id<"groups">,
          year: currentPeriod.year,
        }
      : "skip"
  );

  const yearlyTrend = useQuery(
    api.analytics.getMonthlyTrend,
    group
      ? {
          groupId: groupId as Id<"groups">,
          year: currentPeriod.year,
          month: currentPeriod.month,
          months: 12,
        }
      : "skip"
  );

  if (group === undefined) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md p-4 border-b border-slate-200 flex items-center gap-3 shadow-sm">
          <Link
            href={`/groups/${groupId}`}
            className="text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="h-6 w-24 bg-slate-100 rounded animate-pulse" />
        </header>
        <main className="flex-1 p-4">
          <div className="max-w-lg mx-auto space-y-6">
            <ChartSkeleton type="pie" />
            <ChartSkeleton type="bar" />
          </div>
        </main>
      </div>
    );
  }

  const categoryData = viewType === "month" ? monthlyCategory : yearlyCategory;
  const trendData = viewType === "month" ? monthlyTrend : yearlyTrend;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md p-4 border-b border-slate-200 flex items-center gap-3 shadow-sm">
        <Link
          href={`/groups/${groupId}`}
          className="text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="font-bold text-xl text-slate-800">分析</h1>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* 月/年切り替えタブ */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewType("month")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                viewType === "month"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              今月
            </button>
            <button
              onClick={() => setViewType("year")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                viewType === "year"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              年間
            </button>
          </div>

          {/* カテゴリ別円グラフ */}
          <section>
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              カテゴリ別支出
            </h3>
            {categoryData === undefined ? (
              <ChartSkeleton type="pie" />
            ) : (
              <CategoryPieChart
                data={categoryData.breakdown}
                totalAmount={categoryData.totalAmount}
              />
            )}
          </section>

          {/* 推移グラフ */}
          <section>
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              {viewType === "month" ? "月別推移（6ヶ月）" : "月別推移（12ヶ月）"}
            </h3>
            {trendData === undefined ? (
              <ChartSkeleton type="bar" />
            ) : (
              <MonthlyTrendChart data={trendData.trend} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
