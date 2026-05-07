"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CheckCircle, Trash2, Star, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  createdAt: string;
  product: { id: string; name: string } | null;
  user: { id: string; fullName: string | null } | null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-[var(--border)]"}`}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function loadReviews() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews?filter=${filter}`);
      if (!res.ok) throw new Error("Failed to load");
      setReviews(await res.json());
    } catch {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReviews(); }, [filter]);

  async function handleApprove(id: string) {
    setActionId(id);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to approve");
      await loadReviews();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(id: string) {
    setActionId(id);
    setConfirmDeleteId(null);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await loadReviews();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold">
          Reviews{" "}
          <span className="text-sm font-normal text-[var(--muted)]">({reviews.length})</span>
        </h2>
        <div className="flex gap-2">
          {(["pending", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${
                filter === f
                  ? "bg-[var(--color-primary)] text-white border-transparent"
                  : "border-[var(--border)] hover:border-[var(--color-primary)]"
              }`}
            >
              {f === "pending" ? "Pending Approval" : "All Reviews"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)] text-sm">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-[var(--muted)] text-sm">
            {filter === "pending" ? "No reviews awaiting approval." : "No reviews yet."}
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {reviews.map((review) => (
              <div key={review.id} className="px-4 py-4 flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StarRating rating={review.rating} />
                    <Badge variant={review.isApproved ? "success" : "warning"}>
                      {review.isApproved ? "Approved" : "Pending"}
                    </Badge>
                    {review.isVerifiedPurchase && (
                      <Badge variant="primary">Verified Purchase</Badge>
                    )}
                  </div>
                  {review.title && (
                    <p className="font-medium text-sm">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="text-sm text-[var(--muted)]">{review.body}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                    <span>
                      Product: <span className="font-medium text-[var(--foreground)]">{review.product?.name ?? "—"}</span>
                    </span>
                    <span>
                      By: <span className="font-medium text-[var(--foreground)]">{review.user?.fullName ?? "Guest"}</span>
                    </span>
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!review.isApproved && (
                    <Button
                      size="sm"
                      disabled={actionId === review.id}
                      onClick={() => handleApprove(review.id)}
                    >
                      <CheckCircle className="w-3 h-3" />
                      {actionId === review.id ? "..." : "Approve"}
                    </Button>
                  )}
                  {confirmDeleteId === review.id ? (
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-red-600 font-medium">Delete?</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        disabled={actionId === review.id}
                        onClick={() => handleDelete(review.id)}
                      >
                        {actionId === review.id ? "..." : "Yes"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>No</Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setConfirmDeleteId(review.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
