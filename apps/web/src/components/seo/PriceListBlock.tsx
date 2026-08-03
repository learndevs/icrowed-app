import Link from "next/link";
import { formatLkr, type PriceListData } from "@/lib/price-list";

/**
 * "Price List in Sri Lanka — Updated {Month Year}" block, styled after
 * LuxuryX's proven format: a visible freshness date plus a scannable
 * name-and-price list that Google can quote directly in search snippets.
 */
export function PriceListBlock({
  heading,
  priceList,
  note,
}: {
  heading: string;
  priceList: PriceListData;
  note?: string;
}) {
  return (
    <section className="mb-8 rounded-2xl border border-zinc-200 bg-[#F9F9F9] p-6">
      <h2 className="text-lg font-bold text-black">
        {heading} — {priceList.monthYear}
      </h2>
      <p className="mt-1 text-xs text-zinc-500">
        Prices last checked on {priceList.asOfDate}. All prices in LKR.{" "}
        {note ?? "Island-wide delivery · pickup in Kandy, Kottawa & Matara."}
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
        {priceList.items.map((item) => (
          <li
            key={item.id}
            className="flex items-baseline justify-between gap-3 border-b border-zinc-200/70 py-1.5 text-sm"
          >
            <Link
              href={`/products/${item.slug}`}
              className="truncate text-zinc-700 hover:text-black hover:underline"
            >
              {item.name}
            </Link>
            <span className="shrink-0 font-semibold text-black">{formatLkr(item.price)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
