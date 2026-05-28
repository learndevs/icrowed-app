"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Star, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

export type HomeReview = {
  id: string;
  author: string;
  quote: string;
  rating: number;
};

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

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="rounded p-0.5 transition-transform active:scale-95"
          aria-label={`${s} stars`}
        >
          <Star
            className={`h-7 w-7 ${
              s <= (hovered || value)
                ? "fill-zinc-900 text-zinc-900"
                : "fill-zinc-200 text-zinc-200"
            }`}
            strokeWidth={0}
          />
        </button>
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

const inputClass =
  "h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export function HomeReviewsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<HomeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/site-reviews");
      if (!res.ok) throw new Error("Failed to load");
      const data: HomeReview[] = await res.json();
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const scroll = useCallback((direction: "prev" | "next") => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.34;
    el.scrollBy({ left: direction === "next" ? step : -step, behavior: "smooth" });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/site-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewerName, rating, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");

      setReviews((prev) => [data, ...prev]);
      setReviewerName("");
      setRating(5);
      setBody("");
      setShowForm(false);
      setSubmitted(true);
      window.setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-[#F2F2F2] py-10 sm:py-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-5 lg:px-8">
        <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
          <span className="inline-flex items-center rounded-full border border-blue-500 px-5 py-1.5 type-link text-blue-600">
            Reviews
          </span>
          <h2 className="type-section-heading mt-5 text-zinc-900">
            Words from <em className="type-accent-serif">customers</em>
          </h2>
        </div>

        <div className="mx-auto mb-8 max-w-3xl">
          {!showForm ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50"
              >
                <Plus className="h-4 w-4" />
                Add a review
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900">Share your experience</h3>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  aria-label="Close form"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[200px] flex-1">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Your name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={reviewerName}
                    onChange={(ev) => setReviewerName(ev.target.value)}
                    placeholder="James Carter"
                    className={`${inputClass} w-full`}
                  />
                </div>

                <div className="min-w-[180px]">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Star rating
                  </label>
                  <StarPicker value={rating} onChange={setRating} />
                </div>

                <div className="w-full">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Review
                  </label>
                  <textarea
                    required
                    rows={4}
                    maxLength={2000}
                    value={body}
                    onChange={(ev) => setBody(ev.target.value)}
                    placeholder="Tell others about your experience with iCrowd…"
                    className={`${inputClass} h-auto min-h-[100px] w-full resize-y py-3`}
                  />
                </div>

                {formError && (
                  <p className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {formError}
                  </p>
                )}

                <div className="flex w-full flex-wrap gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {submitting ? "Submitting…" : "Submit review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {submitted && (
            <p className="mt-3 text-center text-sm font-medium text-emerald-700">
              Thank you — your review has been added!
            </p>
          )}
        </div>

        <div className="relative">
          {reviews.length > 0 && (
            <>
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
            </>
          )}

          {loading ? (
            <p className="py-12 text-center text-sm text-zinc-400">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              No reviews yet. Be the first to share your experience!
            </p>
          ) : (
            <div
              ref={trackRef}
              role="region"
              aria-roledescription="carousel"
              aria-label="Customer reviews"
              className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-lg:px-1"
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  data-review-card
                  className="w-[min(92vw,400px)] shrink-0 snap-center lg:w-[calc((100%-2.5rem)/3)] lg:snap-start"
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <p className="mt-4 text-center text-xs text-zinc-400 lg:hidden">
            Swipe to see more reviews
          </p>
        )}
      </div>
    </section>
  );
}
