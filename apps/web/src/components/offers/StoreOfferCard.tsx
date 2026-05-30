import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Tag, Clock } from "lucide-react";
import type { getActiveOffers } from "@icrowd/database/queries";
import { cn } from "@/lib/utils";
import {
  isLocalProductUploadUrl,
  normalizeProductImageUrl,
} from "@/lib/product-image-url";

export type StoreOffer = Awaited<ReturnType<typeof getActiveOffers>>[number];

const OFFER_GRADIENTS = [
  "from-sky-500 to-sky-700",
  "from-rose-500 to-orange-500",
  "from-teal-500 to-cyan-500",
  "from-pink-500 to-rose-600",
  "from-sky-400 to-sky-600",
  "from-orange-500 to-amber-600",
] as const;

function offerGradient(id: string) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return OFFER_GRADIENTS[hash % OFFER_GRADIENTS.length];
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" });
}

export function StoreOfferCard({
  offer,
  className,
}: Readonly<{ offer: StoreOffer; className?: string }>) {
  const href = offer.linkUrl ?? "/products";
  const gradient = offerGradient(offer.id);

  return (
    <Link
      href={href}
      className={cn(
        "relative group rounded-3xl overflow-hidden flex flex-col min-h-44 hover:shadow-xl hover:-translate-y-1 transition-all duration-200",
        className,
      )}
    >
      {offer.imageUrl ? (
        <div className="absolute inset-0">
          <Image
            src={normalizeProductImageUrl(offer.imageUrl)}
            alt={offer.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width:640px) 85vw, (max-width:1024px) 50vw, 33vw"
            unoptimized={isLocalProductUploadUrl(offer.imageUrl)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        </div>
      )}

      <div className="relative flex-1 p-5 flex flex-col justify-between">
        <div>
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
