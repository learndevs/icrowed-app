import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgePercent, Megaphone, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50/80 via-white to-white">
      <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-6 sm:px-5 sm:py-10 lg:px-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-indigo-100 px-6 py-10 text-zinc-900 shadow-[0_20px_60px_rgba(14,165,233,0.12)] sm:px-10 sm:py-14">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-300/25 blur-3xl" />
          <div className="relative max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-700 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              Limited-time savings
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              Offers &amp; Deals
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
              Discover exclusive prices on phones, accessories and more. Grab your favourites
              before these offers end.
            </p>
          </div>
        </header>

        {offers.length === 0 ? (
          <div className="rounded-3xl border border-sky-100 bg-white p-12 text-center shadow-[0_8px_30px_rgba(14,165,233,0.08)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50">
              <Megaphone className="h-6 w-6 text-sky-500" />
            </div>
            <h2 className="font-bold text-zinc-900">More deals are on the way</h2>
            <p className="mt-1 text-sm text-zinc-500">Check back soon for our latest offers.</p>
          </div>
        ) : (
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2 text-sky-600">
                  <BadgePercent className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Today&apos;s picks</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-zinc-900">Latest offers</h2>
              </div>
              <span className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700">
                {offers.length} {offers.length === 1 ? "deal" : "deals"}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-[1.7rem] bg-gradient-to-br from-sky-200 via-blue-100 to-indigo-200 p-px"
                >
                  <OfferCard offer={offer} className="shadow-[0_10px_35px_rgba(14,165,233,0.12)]" />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-lg font-black text-zinc-900">Looking for something else?</p>
            <p className="mt-1 text-sm text-zinc-500">Explore our full collection at great prices.</p>
          </div>
          <Link
            href="/products"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
          >
            Shop all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
