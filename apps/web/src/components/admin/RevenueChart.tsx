"use client";

import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  ComposedChart,
} from "recharts";

type Point = { day: string; revenue: number; orderCount: number };

export function RevenueChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-[var(--muted)]">
        No data for this range.
      </div>
    );
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
          <XAxis dataKey="day" tickFormatter={(d) => d.slice(5)} fontSize={11} />
          <YAxis yAxisId="left" fontSize={11} />
          <YAxis yAxisId="right" orientation="right" fontSize={11} />
          <Tooltip
            formatter={(value, name) => {
              const v = Number(value);
              return name === "revenue"
                ? [`LKR ${v.toLocaleString()}`, "Revenue"]
                : [String(v), "Orders"];
            }}
          />
          <Legend />
          <Bar yAxisId="right" dataKey="orderCount" name="Orders" fill="#dbeafe" />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
