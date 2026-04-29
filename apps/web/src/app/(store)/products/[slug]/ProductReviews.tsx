"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
          className="focus:outline-none"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              s <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-200 fill-gray-200 hover:fill-amber-200 hover:text-amber-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
      setRating(0);
      setTitle("");
      setBody("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="bento-card p-5 sm:p-7">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarDisplay rating={Math.round(avgRating)} />
              <span className="text-sm font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
            </div>
          )}
        </div>
        {!submitted && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            <MessageSquare className="w-4 h-4" />
            Write a Review
          </Button>
        )}
      </div>

      {submitted && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
          Thanks for your review! It will appear after moderation.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-[var(--border)] rounded-2xl bg-gray-50 space-y-4">
          <h3 className="font-semibold text-gray-900">Your Review</h3>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Rating *</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Great product!"
              className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Review</label>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your experience with this product…"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
            />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Review"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <Star className="w-10 h-10 text-gray-200 fill-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <StarDisplay rating={review.rating} />
                  {review.isVerifiedPurchase && (
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatDate(review.createdAt)}</span>
              </div>
              {review.title && (
                <p className="font-semibold text-sm text-gray-900">{review.title}</p>
              )}
              {review.body && (
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.body}</p>
              )}
              <p className="text-xs text-gray-400 mt-1.5">
                — {review.user?.fullName ?? "Anonymous"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
