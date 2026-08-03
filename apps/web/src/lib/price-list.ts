import { formatLkrForSeo } from "@/lib/seo";

export type PriceListEntry = {
  id: string;
  name: string;
  slug: string;
  price: number;
};

export type PriceListData = {
  items: PriceListEntry[];
  /** e.g. "August 2026" — for headings */
  monthYear: string;
  /** e.g. "3 August 2026" — for "prices last checked on ..." copy */
  asOfDate: string;
  updatedAtIso: string;
  priceMin: number;
  priceMax: number;
};

type RawPriceListInput = {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  updatedAt?: Date | string | null;
};

/** Re-export so callers only need one import for on-page LKR formatting. */
export const formatLkr = formatLkrForSeo;

/**
 * Builds a LuxuryX-style "Price List in Sri Lanka" data block: a compact,
 * price-sorted product list plus a freshness date derived from the most
 * recently updated product. Returns null when there's nothing to show.
 */
export function buildPriceListData(
  products: RawPriceListInput[],
  opts?: { limit?: number },
): PriceListData | null {
  if (!products.length) return null;
  const limit = opts?.limit ?? 15;

  const items = [...products]
    .map((p) => ({ id: p.id, name: p.name, slug: p.slug, price: Number(p.price) }))
    .filter((p) => Number.isFinite(p.price) && p.price > 0)
    .sort((a, b) => a.price - b.price);

  if (!items.length) return null;

  const latestUpdatedAt = products.reduce<Date>((latest, p) => {
    if (!p.updatedAt) return latest;
    const d = new Date(p.updatedAt);
    return Number.isFinite(d.getTime()) && d > latest ? d : latest;
  }, new Date(0));
  const freshDate = latestUpdatedAt.getTime() > 0 ? latestUpdatedAt : new Date();

  return {
    items: items.slice(0, limit),
    monthYear: freshDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    asOfDate: freshDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    updatedAtIso: freshDate.toISOString(),
    priceMin: items[0].price,
    priceMax: items[items.length - 1].price,
  };
}

/** e.g. "3 August 2026" — shared formatting for single-product freshness sentences. */
export function formatFreshDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export type BudgetTier = {
  label: string;
  /** Value for the `minPrice` query param (thousands of LKR), or "" for no floor. */
  minParam: string;
  /** Value for the `maxPrice` query param (thousands of LKR), or "" for no ceiling. */
  maxParam: string;
  count: number;
};

function roundBoundary(value: number): number {
  if (value <= 0) return 0;
  const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(value)) - 1);
  return Math.round(value / magnitude) * magnitude;
}

/**
 * Buckets a set of prices into three "Shop by budget" tiers (wasiphone.com
 * pattern). Returns [] when there isn't enough price spread to make tiers
 * meaningful.
 */
export function buildBudgetTiers(prices: number[]): BudgetTier[] {
  const sorted = prices.filter((p) => Number.isFinite(p) && p > 0).sort((a, b) => a - b);
  if (sorted.length < 6) return [];

  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  if (max <= min) return [];

  const lowMax = roundBoundary(min + (max - min) / 3);
  const midMax = roundBoundary(min + (2 * (max - min)) / 3);
  if (lowMax <= 0 || midMax <= lowMax) return [];

  const tiers = [
    {
      label: `Under LKR ${lowMax.toLocaleString("en-LK")}`,
      minParam: "",
      maxParam: String(Math.round(lowMax / 1000)),
      test: (p: number) => p < lowMax,
    },
    {
      label: `LKR ${lowMax.toLocaleString("en-LK")} – ${midMax.toLocaleString("en-LK")}`,
      minParam: String(Math.round(lowMax / 1000)),
      maxParam: String(Math.round(midMax / 1000)),
      test: (p: number) => p >= lowMax && p < midMax,
    },
    {
      label: `Above LKR ${midMax.toLocaleString("en-LK")}`,
      minParam: String(Math.round(midMax / 1000)),
      maxParam: "",
      test: (p: number) => p >= midMax,
    },
  ];

  return tiers
    .map((t) => ({
      label: t.label,
      minParam: t.minParam,
      maxParam: t.maxParam,
      count: sorted.filter(t.test).length,
    }))
    .filter((t) => t.count > 0);
}

export type TagChip = { label: string; href: string };

/**
 * Builds a small row of visible, linkable keyword chips for a product page —
 * the otc.lk / LuxuryX "Keywords" pattern, but rendered as genuine internal
 * links rather than meta-only keyword stuffing.
 */
export function buildProductTagChips(opts: {
  tags?: string[] | null;
  brand?: { name: string; slug: string } | null;
  category?: { name: string; slug: string } | null;
}): TagChip[] {
  const chips: TagChip[] = [];

  for (const tag of opts.tags ?? []) {
    const label = tag.trim();
    if (!label) continue;
    chips.push({ label, href: `/products?search=${encodeURIComponent(label)}` });
  }

  if (opts.brand) {
    chips.push({
      label: `${opts.brand.name} price in Sri Lanka`,
      href: `/products/brands/${opts.brand.slug}`,
    });
  }
  if (opts.category) {
    chips.push({
      label: `${opts.category.name} in Sri Lanka`,
      href: `/categories/${opts.category.slug}`,
    });
  }
  chips.push({ label: "Island-wide delivery", href: "/locations" });

  const seen = new Set<string>();
  return chips.filter((c) => {
    const key = c.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Builds tag chips for a category or brand listing page — links to related
 * brands/categories actually present in that listing, plus a delivery chip.
 */
export function buildListingTagChips(opts: {
  listingName: string;
  related: TagChip[];
  maxRelated?: number;
}): TagChip[] {
  const chips: TagChip[] = opts.related.slice(0, opts.maxRelated ?? 6);
  chips.push({ label: `${opts.listingName} price in Sri Lanka`, href: "/guides" });
  chips.push({ label: "Island-wide delivery", href: "/locations" });

  const seen = new Set<string>();
  return chips.filter((c) => {
    const key = c.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
