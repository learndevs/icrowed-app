import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Megaphone, Tag, Clock } from "lucide-react";
import { getActiveOffers } from "@icrowed/database/queries";

export const metadata: Metadata = { title: "Offers & Deals | iCrowed" };

const OFFER_GRADIENTS = [
  "from-purple-600 to-indigo-600",
  "from-rose-500 to-orange-500",
  "from-teal-500 to-cyan-500",
  "from-pink-500 to-rose-600",
  "from-indigo-500 to-blue-600",
  "from-orange-500 to-amber-600",
] as const;

function offerGradient(id: string) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return OFFER_GRADIENTS[hash % OFFER_GRADIENTS.length];
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" });
}

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
                    <OfferCard key={offer.id} offer={offer} large />
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
                    <OfferCard key={offer.id} offer={offer} />
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

function OfferCard({
  offer,
  large = false,
}: {
  offer: Awaited<ReturnType<typeof getActiveOffers>>[number];
  large?: boolean;
}) {
  const href = offer.linkUrl ?? "/products";
  const gradient = offerGradient(offer.id);

  return (
    <Link
      href={href}
      className={`relative group rounded-3xl overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ${large ? "min-h-52" : "min-h-44"}`}
    >
      {/* Background */}
      {offer.imageUrl ? (
        <div className="absolute inset-0">
          <Image
            src={offer.imageUrl}
            alt={offer.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        </div>
      )}

      {/* Content */}
      <div className="relative flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mb-3">
            {offer.badgeText && (
              <span className="inline-flex items-center gap-1 border border-white/40 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm bg-white/10">
                <Tag className="w-2.5 h-2.5" /> {offer.badgeText}
              </span>
            )}
            {offer.discountPercent && (
              <span className="inline-flex items-center bg-lime-400 text-gray-900 text-[10px] font-black px-2.5 py-1 rounded-full">
                {Number(offer.discountPercent)}% OFF
              </span>
            )}
          </div>

          <h3 className="font-black text-white text-lg leading-snug mb-1">{offer.title}</h3>
          {offer.description && (
            <p className="text-white/75 text-xs leading-relaxed line-clamp-2">{offer.description}</p>
          )}
        </div>

        <div className="flex items-end justify-between mt-4">
          {offer.endsAt && (
            <span className="flex items-center gap-1 text-white/60 text-[10px]">
              <Clock className="w-3 h-3" /> Until {formatDate(offer.endsAt)}
            </span>
          )}
          <ArrowUpRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all ml-auto" />
        </div>
      </div>
    </Link>
  );
}
