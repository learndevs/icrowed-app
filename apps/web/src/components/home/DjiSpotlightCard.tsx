import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function DjiSpotlightCard() {
  return (
    <div className="bento-card lg:col-span-2 flex flex-col p-8 sm:p-10 min-h-0">
      <div className="flex flex-1 flex-col items-center text-center">
        <div className="mb-8 sm:mb-10 flex w-full max-w-[220px] items-center justify-center">
          <Image
            src="/home/dji-logo.png"
            alt="DJI"
            width={220}
            height={88}
            className="h-auto w-full object-contain"
            priority={false}
          />
        </div>

        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gray-400">
          Drones &amp; imaging
        </p>
        <h2 className="mt-3 text-[1.35rem] sm:text-2xl font-semibold text-gray-900 tracking-[-0.02em] leading-snug">
          Best place to buy DJI products
        </h2>
        <p className="mt-3 max-w-[18rem] text-sm leading-relaxed text-gray-500">
          Genuine gear, local support, island-wide delivery.
        </p>
      </div>

      <Link
        href="/products?search=dji"
        className="mt-8 sm:mt-10 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50/80 py-3.5 text-sm font-medium text-gray-900 transition-colors hover:border-gray-300 hover:bg-white"
      >
        Shop DJI
        <ArrowRight className="h-4 w-4 text-gray-400" strokeWidth={2} aria-hidden />
      </Link>
    </div>
  );
}
