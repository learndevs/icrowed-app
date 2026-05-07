"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, BadgeCheck, MessageSquare, LogIn, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: { id: string; fullName: string | null } | null;
}

type SortMode = "recent" | "highest" | "verified";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "w-6 h-6" : size === "md" ? "w-4.5 h-4.5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const labels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none transition-transform active:scale-90"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                s <= (hovered || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-200 fill-gray-200 hover:fill-amber-200 hover:text-amber-200"
              }`}
            />
          </button>
        ))}
      </div>
      {(hovered || value) > 0 && (
        <p className="text-xs font-semibold text-amber-600 h-4">{labels[hovered || value]}</p>
      )}
    </div>
  );
}

function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const counts = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: reviews.filter((rv) => rv.rating === r).length,
  }));
  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="flex flex-col gap-1.5">
      {counts.map(({ star, count }) => (
        <div key={star} className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 w-3 text-right">{star}</span>
          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

function Avatar({ name }: { name: string | null }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  const colors = [
    "bg-indigo-100 text-indigo-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
  ];
  const color = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews]     = useState<Review[]>([]);
  const [loading, setLoading]     = useState(true);
  const [userId, setUserId]       = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [rating, setRating]       = useState(0);
  const [title, setTitle]         = useState("");
  const [body, setBody]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sortMode, setSortMode]   = useState<SortMode>("recent");
  const [showAll, setShowAll]     = useState(false);

  // Check auth
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setAuthChecked(true);
    });
  }, []);

  async function loadReviews() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      if (res.ok) setReviews(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReviews(); }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setFormError("Please select a rating"); return; }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title: title.trim() || null, body: body.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to submit");
      }
      setSubmitted(true);
      setShowForm(false);
      setRating(0); setTitle(""); setBody("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Derived data ─────────────────────────────────────────────────────────────
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const hasUserReviewed = userId
    ? reviews.some((r) => r.user?.id === userId)
    : false;

  const sorted = [...reviews].sort((a, b) => {
    if (sortMode === "highest")  return b.rating - a.rating;
    if (sortMode === "verified") return Number(b.isVerifiedPurchase) - Number(a.isVerifiedPurchase);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const SHOW_COUNT = 5;
  const displayed  = showAll ? sorted : sorted.slice(0, SHOW_COUNT);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="bento-card p-5 sm:p-7 mt-4">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900">Customer Reviews</h2>
          <p className="text-xs text-gray-400 mt-0.5">Reviews are moderated before appearing</p>
        </div>

        {/* Write review button / auth gate */}
        {authChecked && !submitted && !hasUserReviewed && (
          userId ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                showForm
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bento-card text-gray-700 hover:border-indigo-300"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Write a Review
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bento-card text-gray-700 hover:border-indigo-300 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign in to Review
            </Link>
          )
        )}
      </div>

      {/* Rating summary */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 p-5 bg-gray-50 rounded-2xl mb-6">
          {/* Big number */}
          <div className="flex flex-col items-center justify-center gap-1 sm:w-32 shrink-0">
            <p className="text-5xl font-black text-gray-900">{avgRating.toFixed(1)}</p>
            <StarDisplay rating={Math.round(avgRating)} size="md" />
            <p className="text-xs text-gray-400 mt-0.5">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>
          {/* Breakdown bars */}
          <div className="flex-1">
            <RatingBreakdown reviews={reviews} />
          </div>
        </div>
      )}

      {/* Submitted success */}
      {submitted && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Thanks for your review!</p>
            <p className="text-xs text-emerald-600 mt-0.5">It will appear here after moderation.</p>
          </div>
        </div>
      )}

      {/* Already reviewed */}
      {hasUserReviewed && !submitted && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700">
          You&apos;ve already submitted a review for this product.
        </div>
      )}

      {/* Review form */}
      {showForm && userId && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-5 border border-gray-200 rounded-2xl bg-gray-50 space-y-4"
        >
          <h3 className="font-bold text-gray-900">Your Review</h3>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              Rating *
            </label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarise your experience"
              maxLength={100}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-shadow"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Review
            </label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What did you like or dislike? How is build quality, battery life, camera?"
              maxLength={1000}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none transition-shadow"
            />
            <p className="text-right text-[10px] text-gray-400 mt-0.5">{body.length}/1000</p>
          </div>

          {formError && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">
              {formError}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Sort controls */}
      {reviews.length > 1 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs font-semibold text-gray-400">Sort:</span>
          {(["recent", "highest", "verified"] as SortMode[]).map((m) => {
            const labels: Record<SortMode, string> = {
              recent:   "Most Recent",
              highest:  "Highest Rated",
              verified: "Verified First",
            };
            return (
              <button
                key={m}
                onClick={() => setSortMode(m)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  sortMode === m
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {labels[m]}
              </button>
            );
          })}
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-300 fill-gray-200" />
          </div>
          <p className="font-semibold text-gray-700">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to share your experience with this product.</p>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {displayed.map((review) => (
              <div key={review.id} className="flex gap-3 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                <Avatar name={review.user?.fullName ?? null} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">
                        {review.user?.fullName ?? "Anonymous"}
                      </span>
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <BadgeCheck className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{formatDate(review.createdAt)}</span>
                  </div>

                  <StarDisplay rating={review.rating} />

                  {review.title && (
                    <p className="font-semibold text-sm text-gray-900 mt-1.5">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{review.body}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {sorted.length > SHOW_COUNT && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {showAll ? "Show fewer" : `Show all ${sorted.length} reviews`}
              <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
