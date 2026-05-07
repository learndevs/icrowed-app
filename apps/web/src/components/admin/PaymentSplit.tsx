"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type Slice = { method: string; count: number; total: number };

const COLORS: Record<string, string> = {
  stripe: "#6366f1",
  payhere: "#06b6d4",
  bank_transfer: "#10b981",
  cash_on_delivery: "#f59e0b",
};

export function PaymentSplit({ data }: { data: Slice[] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-[var(--muted)]">
        No payments.
      </div>
    );
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="method"
            outerRadius={80}
          >
            {data.map((d) => (
              <Cell key={d.method} fill={COLORS[d.method] ?? "#9ca3af"} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `LKR ${Number(value).toLocaleString()}`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
