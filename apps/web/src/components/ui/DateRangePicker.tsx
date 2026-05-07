"use client";

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar } from "lucide-react";
import { useState } from "react";

const PRESETS: Array<{ key: string; label: string; days: number }> = [
  { key: "today", label: "Today", days: 0 },
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
];

export type RangeKey = "today" | "7d" | "30d" | "90d" | "custom";

export function rangeToDates(
  range: string | null | undefined,
  fromParam?: string | null,
  toParam?: string | null
): { from: Date; to: Date } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);

  if (range === "custom" && fromParam && toParam) {
    return { from: new Date(fromParam), to: new Date(toParam) };
  }

  const preset = PRESETS.find((p) => p.key === range) ?? PRESETS[2]; // default 30d
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  if (preset.key === "today") {
    return { from, to };
  }
  from.setDate(from.getDate() - preset.days);
  return { from, to };
}

export function DateRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("range") ?? "30d";
  const fromParam = searchParams.get("from") ?? "";
  const toParam = searchParams.get("to") ?? "";
  const [customOpen, setCustomOpen] = useState(current === "custom");
  const [from, setFrom] = useState(fromParam);
  const [to, setTo] = useState(toParam);

  function setRange(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", key);
    if (key !== "custom") {
      params.delete("from");
      params.delete("to");
      setCustomOpen(false);
    } else {
      setCustomOpen(true);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyCustom() {
    if (!from || !to) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", "custom");
    params.set("from", from);
    params.set("to", to);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar className="w-4 h-4 text-[var(--muted)]" />
      {PRESETS.map((p) => (
        <button
          key={p.key}
          onClick={() => setRange(p.key)}
          className={cn(
            "h-8 px-3 rounded-lg text-xs font-medium border",
            current === p.key
              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
              : "bg-white border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface)]"
          )}
        >
          {p.label}
        </button>
      ))}
      <button
        onClick={() => setRange("custom")}
        className={cn(
          "h-8 px-3 rounded-lg text-xs font-medium border",
          current === "custom"
            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
            : "bg-white border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface)]"
        )}
      >
        Custom
      </button>
      {customOpen && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="h-8 px-2 rounded-lg border border-[var(--border)] text-xs"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <span className="text-xs text-[var(--muted)]">→</span>
          <input
            type="date"
            className="h-8 px-2 rounded-lg border border-[var(--border)] text-xs"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <button
            onClick={applyCustom}
            className="h-8 px-3 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
