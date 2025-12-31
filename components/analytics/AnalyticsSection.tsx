"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CategoryPieChart } from "./CategoryPieChart";
import { MonthlyTrendChart } from "./MonthlyTrendChart";
import { ChartSkeleton } from "./ChartSkeleton";

type AnalyticsSectionProps = {
  groupId: Id<"groups">;
  year: number;
  month: number;
};

export function AnalyticsSection({
  groupId,
  year,
  month,
}: AnalyticsSectionProps) {
  const categoryBreakdown = useQuery(api.analytics.getCategoryBreakdown, {
    groupId,
    year,
    month,
  });

  const monthlyTrend = useQuery(api.analytics.getMonthlyTrend, {
    groupId,
    year,
    month,
    months: 6,
  });

  const annualTrend = useQuery(api.analytics.getMonthlyTrend, {
    groupId,
    year,
    month,
    months: 12,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* カテゴリ別円グラフ */}
      <section>
        <h3 className="text-sm font-medium text-slate-700 mb-3">
          カテゴリ別支出
        </h3>
        {categoryBreakdown === undefined ? (
          <ChartSkeleton type="pie" />
        ) : (
          <CategoryPieChart
            data={categoryBreakdown.breakdown}
            totalAmount={categoryBreakdown.totalAmount}
          />
        )}
      </section>

      {/* 月別推移グラフ（6ヶ月） */}
      <section>
        <h3 className="text-sm font-medium text-slate-700 mb-3">
          月別推移（6ヶ月）
        </h3>
        {monthlyTrend === undefined ? (
          <ChartSkeleton type="bar" />
        ) : (
          <MonthlyTrendChart data={monthlyTrend.trend} />
        )}
      </section>

      {/* 年間推移グラフ（12ヶ月） */}
      <section>
        <h3 className="text-sm font-medium text-slate-700 mb-3">
          年間推移（12ヶ月）
        </h3>
        {annualTrend === undefined ? (
          <ChartSkeleton type="bar" />
        ) : (
          <MonthlyTrendChart data={annualTrend.trend} />
        )}
      </section>
    </div>
  );
}
