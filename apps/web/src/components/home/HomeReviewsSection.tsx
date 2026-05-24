"use client";

import { useRef, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

export type HomeReview = {
  id: string;
  author: string;
  quote: string;
  rating: number;
};

/** Storefront testimonials — 6 slides (Figma). */
export const HOME_REVIEWS: HomeReview[] = [
  {
    id: "1",
    author: "James Carter",
    rating: 5,
    quote:
      "I've been using this for about a week now, and it completely exceeded my expectations. The battery life holds up exactly as advertised, and the audio/display quality is incredibly crisp. Setup was seamless out of the box, and the build feels very premium. Highly recommend to anyone on the fence!",
  },
  {
    id: "2",
    author: "Sarah Mitchell",
    rating: 5,
    quote:
      "Fast delivery to Colombo and the product was exactly as described. Genuine warranty and friendly support when I had a question about setup. Will definitely order again from iCrowd.",
  },
  {
    id: "3",
    author: "David Perera",
    rating: 5,
    quote:
      "Best prices I found for flagship phones in Sri Lanka. Checkout was smooth, tracking updates were clear, and the packaging felt secure. Very happy with my purchase.",
  },
  {
    id: "4",
    author: "Nimal Fernando",
    rating: 5,
    quote:
      "Picked up earbuds and a charger — both work flawlessly with my iPhone. The sound quality is crisp and the case feels premium. Great value for money.",
  },
  {
    id: "5",
    author: "Anjali Silva",
    rating: 5,
    quote:
      "I compared prices across several shops and iCrowd came out on top. Product arrived in perfect condition and the team answered my WhatsApp questions quickly.",
  },
  {
    id: "6",
    author: "Michael Brooks",
    rating: 5,
    quote:
      "Smooth buying experience from browsing to delivery. The site is easy to use on mobile, and the product matched the photos and specs. Five stars from me.",
  },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-zinc-900 text-zinc-900" : "fill-zinc-200 text-zinc-200"}`}
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: HomeReview }) {
  return (
    <article className="flex h-full min-h-[280px] flex-col rounded-3xl bg-white px-6 py-8 shadow-[0_4px_24px_rgba(15,23,42,0.06)] sm:min-h-[300px] sm:px-8 sm:py-9">
      <StarRow rating={review.rating} />
      <blockquote className="mt-5 flex-1 text-left text-sm italic leading-relaxed text-zinc-700 sm:text-[15px]">
        &ldquo;{review.quote}&rdquo;
      </blockquote>
      <p className="mt-6 text-base font-bold text-zinc-900">{review.author}</p>
    </article>
  );
}

export function HomeReviewsSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: "prev" | "next") => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.34;
    el.scrollBy({ left: direction === "next" ? step : -step, behavior: "smooth" });
  }, []);

  return (
    <section className="bg-[#F2F2F2] py-10 sm:py-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-5 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
          <span className="inline-flex items-center rounded-full border border-blue-500 px-5 py-1.5 type-link text-blue-600">
            Reviews
          </span>
          <h2 className="type-section-heading mt-5 text-zinc-900">
            Words from <em className="type-accent-serif">customers</em>
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative">
          <button
            type="button"
            onClick={() => scroll("prev")}
            aria-label="Previous reviews"
            className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-md transition hover:bg-zinc-50 lg:flex xl:-left-4"
          >
            <ChevronLeft className="h-5 w-5 text-zinc-700" />
          </button>
          <button
            type="button"
            onClick={() => scroll("next")}
            aria-label="Next reviews"
            className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-md transition hover:bg-zinc-50 lg:flex xl:-right-4"
          >
            <ChevronRight className="h-5 w-5 text-zinc-700" />
          </button>

          <div
            ref={trackRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="Customer reviews"
            className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-lg:px-1"
          >
            {HOME_REVIEWS.map((review) => (
              <div
                key={review.id}
                data-review-card
                className="w-[min(92vw,400px)] shrink-0 snap-center lg:w-[calc((100%-2.5rem)/3)] lg:snap-start"
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-zinc-400 lg:hidden">
          Swipe to see more reviews
        </p>
      </div>
    </section>
  );
}
