import { Card, CardContent } from "./Card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  trend?: { delta: number; suffix?: string } | null;
  color?: string; // Tailwind classes for the icon bubble (e.g. "text-green-600 bg-green-50")
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
  color = "text-[var(--brand-700)] bg-[var(--brand-100)]",
}: StatCardProps) {
  const trendPositive = trend && trend.delta >= 0;
  return (
    <Card>
      <CardContent className="flex items-start gap-4">
        {icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              color
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-2xl font-bold text-foreground truncate">
            {value}
          </p>
          <p className="text-xs text-muted mt-0.5">{label}</p>
          <div className="flex items-center gap-2 mt-1">
            {sub && <p className="text-xs text-muted">{sub}</p>}
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trendPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trendPositive ? "▲" : "▼"} {Math.abs(trend.delta).toFixed(1)}
                {trend.suffix ?? "%"}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
