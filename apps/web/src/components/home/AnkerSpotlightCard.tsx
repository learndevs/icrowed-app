import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getLowestPricedProductByBrandSlug } from "@icrowed/database/queries";

function formatPrice(p: number) {
  return "LKR " + p.toLocaleString("en-LK");
}

interface ProductImage {
  isPrimary: boolean;
  url: string;
  altText?: string | null;
}

export async function AnkerSpotlightCard() {
  const cheapest = await getLowestPricedProductByBrandSlug("anker").catch(() => null);
  const images = cheapest?.images as ProductImage[] | undefined;
  const thumb =
    images?.find((i) => i.isPrimary)?.url ??
    images?.[0]?.url ??
    null;
  const price =
    cheapest != null ? Number(cheapest.price) : null;

  return (
    <div className="bento-card lg:col-span-2 flex flex-col p-6 sm:p-7 min-h-0 overflow-hidden border border-sky-100/80 bg-gradient-to-b from-white to-sky-50/40">
      <div className="flex flex-1 flex-col">
        <div className="mb-6 flex w-full items-end justify-between gap-4">
          <div className="min-w-0 flex-1 flex items-center justify-start">
            <Image
              src="/home/anker-logo.svg"
              alt="Anker"
              width={280}
              height={98}
              className="h-14 w-auto max-w-[min(100%,280px)] object-contain object-left sm:h-16"
              priority={false}
            />
          </div>
          <span className="shrink-0 self-start rounded-full bg-sky-100/90 px-3 py-1 text-[11px] font-semibold text-sky-800">
            From LKR {price != null ? price.toLocaleString("en-LK") : "—"}
          </span>
        </div>

        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
          Charging · Power · Audio
        </p>
        <h2 className="mt-2 text-[1.2rem] font-black tracking-tight text-gray-900 leading-snug sm:text-xl">
          Lowest prices on genuine gear
        </h2>
        <p className="mt-2 max-w-[17rem] text-sm leading-relaxed text-gray-500">
          Shop cables, power banks, and Soundcore earbuds at our best entry prices.
        </p>

        {thumb && cheapest && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/80 p-3 ring-1 ring-sky-100/90 shadow-sm">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-sky-100 to-sky-50">
              <Image
                src={thumb}
                alt={cheapest.name}
                fill
                className="object-contain p-1"
                sizes="56px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-gray-900">{cheapest.name}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">Cheapest in stock</p>
              <p className="mt-1 text-sm font-black text-[#00a9e0]">
                {formatPrice(Number(cheapest.price))}
              </p>
            </div>
          </div>
        )}
      </div>

      <Link
        href="/products?brand=anker"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-200/90 bg-white py-3.5 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:border-[#00a9e0]/40 hover:bg-sky-50/80"
      >
        Shop collection
        <ArrowRight className="h-4 w-4 text-[#00a9e0]" strokeWidth={2} aria-hidden />
      </Link>
    </div>
  );
}
