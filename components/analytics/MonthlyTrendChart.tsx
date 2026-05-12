"use client";

import { memo, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type TrendData = {
  year: number;
  month: number;
  label: string;
  amount: number;
  isCurrent: boolean;
};

type MonthlyTrendChartProps = {
  data: TrendData[];
};

export const MonthlyTrendChart = memo(function MonthlyTrendChart({
  data,
}: MonthlyTrendChartProps) {
  const yAxisMax = useMemo(() => {
    if (data.length === 0) return 10000;
    const max = Math.max(...data.map((d) => d.amount));
    return max > 0 ? Math.ceil(max / 10000) * 10000 : 10000;
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <p>推移データがありません</p>
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, yAxisMax]}
            tickFormatter={(value) =>
              value >= 10000 ? `${value / 10000}万` : value.toLocaleString()
            }
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            formatter={(value) => [
              `¥${Number(value).toLocaleString()}`,
              "支出",
            ]}
            labelFormatter={(label) => String(label)}
          />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isCurrent ? "#2563eb" : "#94a3b8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
