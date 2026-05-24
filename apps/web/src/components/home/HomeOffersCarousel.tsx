"use client";

import { useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HomeOfferCard, type HomeOfferItem } from "./HomeOfferCard";

export function HomeOffersCarousel({ offers }: Readonly<{ offers: HomeOfferItem[] }>) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: "prev" | "next") => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-offer-card]");
    const gap = 20;
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.34;
    el.scrollBy({ left: direction === "next" ? step : -step, behavior: "smooth" });
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scroll("prev")}
        aria-label="Previous offers"
        className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-md transition hover:bg-zinc-50 lg:flex xl:-left-4"
      >
        <ChevronLeft className="h-5 w-5 text-zinc-700" />
      </button>
      <button
        type="button"
        onClick={() => scroll("next")}
        aria-label="Next offers"
        className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-md transition hover:bg-zinc-50 lg:flex xl:-right-4"
      >
        <ChevronRight className="h-5 w-5 text-zinc-700" />
      </button>

      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Offers"
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-lg:scroll-px-[calc((100%-min(88vw,420px))/2)] lg:scroll-px-0"
      >
        {offers.map((offer) => (
          <div
            key={offer.id}
            data-offer-card
            className="w-[min(88vw,420px)] shrink-0 snap-center lg:w-[calc((100%-2.5rem)/3)] lg:snap-start"
          >
            <HomeOfferCard offer={offer} />
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-zinc-400 lg:hidden">Swipe to see more offers</p>
    </div>
  );
}
