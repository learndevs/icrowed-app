import Link from "next/link";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
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
        <>
          {ordered.length > 1 ? (
            <p className="sm:hidden text-[11px] text-gray-500 mb-2 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden />
              <span>Swipe to browse offers</span>
            </p>
          ) : null}
          {/* Mobile: touch carousel (no arrows); fixed slide size so every card matches */}
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Hot offers"
            className="flex flex-nowrap gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth snap-x snap-mandatory touch-pan-x pb-2 -mx-3 px-3 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:overscroll-auto sm:snap-none sm:touch-auto sm:px-0 sm:pb-0 lg:grid-cols-3"
          >
            {ordered.map((offer) => (
              <div
                key={offer.id}
                className="snap-center shrink-0 h-44 w-[min(20rem,calc(100vw-2rem))] sm:h-auto sm:w-auto sm:min-h-0 sm:shrink"
              >
                <StoreOfferCard
                  offer={offer}
                  className="h-full min-h-0 sm:h-auto sm:min-h-44"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
