import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Megaphone } from "lucide-react";
import { getActiveOffers } from "@icrowd/database/queries";
import { OfferCard } from "@/components/offers/OfferCard";
import { queryStorefront } from "@/lib/storefront-query";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Offers & Deals",
  description: "Current deals and promotions on phones and accessories at iCrowd Sri Lanka.",
  path: "/offers",
});

export const revalidate = 60;

function mapOffer(o: Awaited<ReturnType<typeof getActiveOffers>>[number]) {
  return {
    id: o.id,
    title: o.title,
    description: o.description,
    imageUrl: o.imageUrl,
    linkUrl: o.linkUrl,
    instagramUrl: o.instagramUrl,
  };
}

export default async function OffersPage() {
  const offers = (await queryStorefront("offers-page", () => getActiveOffers())).map(mapOffer);

  return (
    <div className="bento-bg min-h-screen">
      <div className="mx-auto max-w-[1400px] space-y-6 px-3 py-6 sm:px-5 lg:px-8">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500">
              <Megaphone className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-rose-500">Limited Time</span>
          </div>
          <h1 className="text-3xl font-black leading-tight text-gray-900 sm:text-4xl">
            Offers &amp; Deals
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Exclusive discounts — shop before they&apos;re gone
          </p>
        </div>

        {offers.length === 0 ? (
          <div className="bento-card p-12 text-center">
            <Megaphone className="mx-auto mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-400">No active offers right now. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}

        <div className="bento-card flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
          <div>
            <p className="text-lg font-black text-gray-900">Want more deals?</p>
            <p className="mt-0.5 text-sm text-gray-400">Browse our full catalog for the best prices</p>
          </div>
          <Link
            href="/products"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-600"
          >
            Shop All Products <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
