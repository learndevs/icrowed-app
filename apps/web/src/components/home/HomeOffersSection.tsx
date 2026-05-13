import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveOffers } from "@icrowed/database/queries";
import { StoreOfferCard } from "@/components/offers/StoreOfferCard";

/** Same ordering as `/offers`: featured first, then the rest (each group by `sortOrder` from the query). */
function offersForHome(offers: Awaited<ReturnType<typeof getActiveOffers>>) {
  const featured = offers.filter((o) => o.isFeatured);
  const regular = offers.filter((o) => !o.isFeatured);
  return [...featured, ...regular];
}

export async function HomeOffersSection() {
  const offers = await getActiveOffers().catch(() => []);
  const ordered = offersForHome(offers);

  return (
    <section className="px-3 sm:px-5 lg:px-8 py-4 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between gap-3 mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 truncate min-w-0">Hot Offers</h2>
        <Link
          href="/offers"
          className="shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          All offers <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {ordered.length === 0 ? (
        <p className="text-sm text-gray-500">No active offers right now. Check back soon!</p>
      ) : (
        /* Mobile: snap carousel | sm+: 2-col grid | lg+: 3-col grid */
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Hot offers"
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:snap-none sm:px-0 lg:grid-cols-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {ordered.map((offer) => (
            <div
              key={offer.id}
              className="snap-start shrink-0 w-[80vw] sm:w-auto"
            >
              <StoreOfferCard
                offer={offer}
                className="h-64 sm:h-72"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
