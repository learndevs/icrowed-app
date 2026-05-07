export type RangeKey = "today" | "7d" | "30d" | "90d" | "custom";

export const RANGE_PRESETS: Array<{ key: string; label: string; days: number }> = [
  { key: "today", label: "Today", days: 0 },
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
];

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

  const preset = RANGE_PRESETS.find((p) => p.key === range) ?? RANGE_PRESETS[2];
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  if (preset.key === "today") {
    return { from, to };
  }
  from.setDate(from.getDate() - preset.days);
  return { from, to };
}
