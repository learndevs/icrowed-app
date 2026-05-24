import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Megaphone } from "lucide-react";
import { getActiveOffers } from "@icrowd/database/queries";
import { StoreOfferCard } from "@/components/offers/StoreOfferCard";

export const metadata: Metadata = { title: "Offers & Deals | iCrowd" };

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const offers = await getActiveOffers().catch(() => []);

  const featured = offers.filter((o) => o.isFeatured);
  const regular = offers.filter((o) => !o.isFeatured);

  return (
    <div className="bento-bg min-h-screen">
      <div className="px-3 sm:px-5 lg:px-8 py-6 max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center">
              <Megaphone className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold tracking-widest text-rose-500 uppercase">Limited Time</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            Offers &amp; Deals
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Exclusive discounts — shop before they&apos;re gone
          </p>
        </div>

        {offers.length === 0 ? (
          <div className="bento-card p-12 text-center">
            <Megaphone className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No active offers right now. Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Featured offers */}
            {featured.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-3">Featured Deals</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {featured.map((offer) => (
                    <StoreOfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              </div>
            )}

            {/* Regular offers */}
            {regular.length > 0 && (
              <div>
                {featured.length > 0 && (
                  <h2 className="text-base font-bold text-gray-900 mb-3">More Offers</h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {regular.map((offer) => (
                    <StoreOfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Browse all products CTA */}
        <div className="bento-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-black text-lg text-gray-900">Want more deals?</p>
            <p className="text-gray-400 text-sm mt-0.5">Browse our full catalog for the best prices</p>
          </div>
          <Link
            href="/products"
            className="shrink-0 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            Shop All Products <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
