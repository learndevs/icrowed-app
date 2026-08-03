import Link from "next/link";
import type { BudgetTier } from "@/lib/price-list";

/**
 * "Shop by budget" price-tier shelf (wasiphone.com pattern) — links into the
 * existing minPrice/maxPrice query filters on the product listing.
 */
export function BudgetShelf({ tiers, basePath }: { tiers: BudgetTier[]; basePath: string }) {
  if (tiers.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-black">
        Shop by budget
      </h2>
      <div className="flex flex-wrap gap-2">
        {tiers.map((tier) => {
          const params = new URLSearchParams();
          if (tier.minParam) params.set("minPrice", tier.minParam);
          if (tier.maxParam) params.set("maxPrice", tier.maxParam);
          const query = params.toString();
          return (
            <Link
              key={tier.label}
              href={query ? `${basePath}?${query}` : basePath}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-black"
            >
              {tier.label}{" "}
              <span className="text-zinc-400">({tier.count})</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
