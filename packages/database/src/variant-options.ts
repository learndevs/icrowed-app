/** Canonical storefront option keys stored in `product_variants.options` (JSON). */
export const VARIANT_OPTION_KEYS = [
  "color",
  "storage",
  "warranty",
  "volume",
  "ram",
] as const;

export type VariantOptionKey = (typeof VARIANT_OPTION_KEYS)[number];

export const VARIANT_OPTION_LABELS: Record<VariantOptionKey, string> = {
  color: "Color",
  storage: "Storage",
  warranty: "Warranty",
  volume: "Volume",
  ram: "RAM",
};

function trimStr(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}

/** Normalize DB `options` JSON to canonical keys; maps legacy `size` → `volume` when volume is empty. */
export function normalizeVariantOptions(raw: unknown): Partial<Record<VariantOptionKey, string>> {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const out: Partial<Record<VariantOptionKey, string>> = {};
  for (const key of VARIANT_OPTION_KEYS) {
    const v = trimStr(o[key]);
    if (v) out[key] = v;
  }
  if (!out.volume) {
    const legacy = trimStr(o.size);
    if (legacy) out.volume = legacy;
  }
  return out;
}

/** Sort variants by admin row precedence (`sort_order`, then name). */
export function sortVariantsByPrecedence<T extends { sortOrder?: number | null; name?: string }>(
  variants: ReadonlyArray<T>,
): T[] {
  return [...variants].sort((a, b) => {
    const ao = a.sortOrder ?? 0;
    const bo = b.sortOrder ?? 0;
    if (ao !== bo) return ao - bo;
    return String(a.name ?? "").localeCompare(String(b.name ?? ""));
  });
}

/**
 * Option dimensions to show on the storefront, in admin row precedence order.
 * Pass variants sorted by {@link sortVariantsByPrecedence} (or unsorted — this sorts internally).
 */
export function activeVariantDimensions(
  variants: ReadonlyArray<{ options: unknown; sortOrder?: number | null; name?: string }>,
): VariantOptionKey[] {
  const seen = new Set<VariantOptionKey>();
  const out: VariantOptionKey[] = [];
  for (const v of sortVariantsByPrecedence(variants)) {
    const n = normalizeVariantOptions(v.options);
    for (const k of VARIANT_OPTION_KEYS) {
      if (n[k] && !seen.has(k)) {
        seen.add(k);
        out.push(k);
      }
    }
  }
  return out;
}

/** Human-readable label for cart / line items (no "variant" wording). */
export function formatVariantChoiceLabel(
  options: unknown,
  nameFallback: string,
): string {
  const n = normalizeVariantOptions(options);
  const parts = VARIANT_OPTION_KEYS.map((k) => n[k]).filter(Boolean) as string[];
  if (parts.length) return parts.join(" · ");
  const name = trimStr(nameFallback);
  return name ?? "Option";
}

const SWATCH_HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function expand3DigitHex(hex: string): string {
  if (hex.length !== 4) return hex.toLowerCase();
  const [, r, g, b] = hex;
  return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
}

/** Normalize admin/storefront swatch input to lowercase `#rrggbb` (or undefined if invalid). */
export function normalizeSwatchHexInput(input: string | undefined | null): string | undefined {
  const t = trimStr(input);
  if (!t) return undefined;
  const withHash = t.startsWith("#") ? t : `#${t}`;
  if (!SWATCH_HEX.test(withHash)) return undefined;
  return withHash.length === 4 ? expand3DigitHex(withHash) : withHash.toLowerCase();
}

/** Read optional swatch hex from raw `options` JSON (not a selectable dimension — pairs with `color`). */
export function parseSwatchHexFromOptions(raw: unknown): string | undefined {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const combined =
    trimStr(o.colorHex) ??
    trimStr(o.colourHex) ??
    trimStr(o.color_code) ??
    trimStr(o.swatchHex) ??
    trimStr(o.color_hex) ??
    trimStr(o.swatch_hex);
  return normalizeSwatchHexInput(combined ?? undefined);
}

/**
 * When `colorHex` is not stored, infer a reasonable swatch from the color name (legacy rows, imports).
 * More specific phrases are checked first.
 */
export function guessHexFromColorLabel(label: string): string | undefined {
  const s = label.trim().toLowerCase();
  if (!s) return undefined;

  const rules: { test: (x: string) => boolean; hex: string }[] = [
    { test: (x) => x.includes("natural") && x.includes("titanium"), hex: "#b8b0a4" },
    { test: (x) => x.includes("desert") && x.includes("titanium"), hex: "#c4a882" },
    { test: (x) => x.includes("blue") && x.includes("titanium"), hex: "#55606a" },
    { test: (x) => x.includes("white") && x.includes("titanium"), hex: "#e8e6e1" },
    { test: (x) => x.includes("black") && x.includes("titanium"), hex: "#3e3e41" },
    { test: (x) => x.includes("titanium"), hex: "#8a8680" },
    { test: (x) => x.includes("ultramarine"), hex: "#2e3a8c" },
    { test: (x) => x.includes("teal") && !x.includes("titanium"), hex: "#3d6b5e" },
    { test: (x) => x.includes("midnight"), hex: "#1c1c1e" },
    { test: (x) => x.includes("starlight"), hex: "#f5f5f0" },
    { test: (x) => x.includes("graphite"), hex: "#54524d" },
    { test: (x) => x.includes("sierra") && x.includes("blue"), hex: "#9bb5ce" },
    { test: (x) => x.includes("pacific") && x.includes("blue"), hex: "#5b7c99" },
    { test: (x) => x.includes("alpine") && x.includes("green"), hex: "#4f5d4a" },
    { test: (x) => x.includes("space") && x.includes("gray"), hex: "#535150" },
    { test: (x) => x.includes("space") && x.includes("grey"), hex: "#535150" },
    { test: (x) => x.includes("product") && x.includes("red"), hex: "#bf0013" },
    { test: (x) => x.includes("(red)"), hex: "#bf0013" },
    { test: (x) => x.includes("lavender"), hex: "#c8c2d8" },
    { test: (x) => x.includes("coral"), hex: "#ff6b5a" },
    { test: (x) => x.includes("navy"), hex: "#1e3a5f" },
    { test: (x) => x.includes("olive"), hex: "#556b2f" },
    { test: (x) => x.includes("silver"), hex: "#c0c0c2" },
    { test: (x) => x.includes("gold"), hex: "#e6c255" },
    { test: (x) => x.includes("rose") && x.includes("gold"), hex: "#eec6c6" },
    { test: (x) => x.includes("phantom"), hex: "#1a1a1a" },
    { test: (x) => x.includes("cloud"), hex: "#f5f5f7" },
    { test: (x) => x.includes("matte") && x.includes("black"), hex: "#1c1c1e" },
  ];
  for (const { test, hex } of rules) {
    if (test(s)) return hex;
  }

  const simple: Record<string, string> = {
    black: "#1c1c1e",
    white: "#f5f5f7",
    blue: "#2563eb",
    red: "#dc2626",
    green: "#16a34a",
    yellow: "#eab308",
    pink: "#ec4899",
    purple: "#9333ea",
    orange: "#ea580c",
    gray: "#9ca3af",
    grey: "#9ca3af",
  };
  if (simple[s]) return simple[s];
  const tokens = s.split(/[\s/·|,]+/).filter(Boolean);
  for (const t of tokens) {
    if (simple[t]) return simple[t];
  }
  return undefined;
}

/** Map color label (e.g. "Titanium Black") → hex from variants that define `colorHex` in options. */
export function colorSwatchHexByValue(
  variants: ReadonlyArray<{ options: unknown }>,
): ReadonlyMap<string, string> {
  const m = new Map<string, string>();
  for (const v of variants) {
    const label = normalizeVariantOptions(v.options).color;
    if (!label || m.has(label)) continue;
    const hex = parseSwatchHexFromOptions(v.options);
    if (hex) m.set(label, hex);
  }
  for (const v of variants) {
    const label = normalizeVariantOptions(v.options).color;
    if (!label || m.has(label)) continue;
    const guessed = guessHexFromColorLabel(label);
    if (guessed) m.set(label, guessed);
  }
  return m;
}
