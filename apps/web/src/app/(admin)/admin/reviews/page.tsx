"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CheckCircle, Trash2, Star, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Tab = "product" | "site";

interface ProductReview {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  reviewerName: string | null;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  createdAt: string;
  product: { id: string; name: string } | null;
  user: { id: string; fullName: string | null } | null;
}

interface SiteReview {
  id: string;
  rating: number;
  body: string;
  reviewerName: string;
  isApproved: boolean;
  createdAt: string;
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

function DeleteButton({
  reviewId,
  actionId,
  confirmDeleteId,
  onConfirm,
  onCancel,
  onDelete,
}: {
  reviewId: string;
  actionId: string | null;
  confirmDeleteId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  if (confirmDeleteId === reviewId) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-red-600 font-medium">Delete?</span>
        <Button
          size="sm"
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50"
          disabled={actionId === reviewId}
          onClick={onDelete}
        >
          {actionId === reviewId ? "..." : "Yes"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          No
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="border-red-200 text-red-600 hover:bg-red-50"
      onClick={onConfirm}
    >
      <Trash2 className="w-3 h-3" />
    </Button>
  );
}

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<Tab>("product");
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [siteReviews, setSiteReviews] = useState<SiteReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function loadProductReviews() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews?filter=${filter}`);
      if (!res.ok) throw new Error("Failed to load");
      setProductReviews(await res.json());
    } catch {
      setError("Failed to load product reviews");
    } finally {
      setLoading(false);
    }
  }

  async function loadSiteReviews() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/site-reviews");
      if (!res.ok) throw new Error("Failed to load");
      setSiteReviews(await res.json());
    } catch {
      setError("Failed to load home page reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "product") {
      void loadProductReviews();
    } else {
      void loadSiteReviews();
    }
  }, [tab, filter]);

  async function handleApproveProduct(id: string) {
    setActionId(id);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to approve");
      await loadProductReviews();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionId(null);
    }
  }

  async function handleDeleteProduct(id: string) {
    setActionId(id);
    setConfirmDeleteId(null);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await loadProductReviews();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setActionId(null);
    }
  }

  async function handleDeleteSite(id: string) {
    setActionId(id);
    setConfirmDeleteId(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/site-reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await loadSiteReviews();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setActionId(null);
    }
  }

  const count = tab === "product" ? productReviews.length : siteReviews.length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold">
          Reviews{" "}
          <span className="text-sm font-normal text-[var(--muted)]">({count})</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 rounded-lg border border-[var(--border)] p-0.5">
            <button
              type="button"
              onClick={() => {
                setTab("product");
                setConfirmDeleteId(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === "product"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Product
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("site");
                setConfirmDeleteId(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === "site"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Home page
            </button>
          </div>
          {tab === "product" &&
            (["pending", "all"] as const).map((f) => (
              <button
                key={f}
                type="button"
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
          <button type="button" onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)] text-sm">Loading reviews...</div>
        ) : tab === "product" ? (
          productReviews.length === 0 ? (
            <div className="p-8 text-center text-[var(--muted)] text-sm">
              {filter === "pending" ? "No reviews awaiting approval." : "No product reviews yet."}
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {productReviews.map((review) => (
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
                    {review.title && <p className="font-medium text-sm">{review.title}</p>}
                    {review.body && <p className="text-sm text-[var(--muted)]">{review.body}</p>}
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                      <span>
                        Product:{" "}
                        <span className="font-medium text-[var(--foreground)]">
                          {review.product?.name ?? "—"}
                        </span>
                      </span>
                      <span>
                        By:{" "}
                        <span className="font-medium text-[var(--foreground)]">
                          {review.reviewerName ?? review.user?.fullName ?? "Guest"}
                        </span>
                      </span>
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!review.isApproved && (
                      <Button
                        size="sm"
                        disabled={actionId === review.id}
                        onClick={() => handleApproveProduct(review.id)}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {actionId === review.id ? "..." : "Approve"}
                      </Button>
                    )}
                    <DeleteButton
                      reviewId={review.id}
                      actionId={actionId}
                      confirmDeleteId={confirmDeleteId}
                      onConfirm={() => setConfirmDeleteId(review.id)}
                      onCancel={() => setConfirmDeleteId(null)}
                      onDelete={() => handleDeleteProduct(review.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : siteReviews.length === 0 ? (
          <div className="p-8 text-center text-[var(--muted)] text-sm">
            No home page reviews yet.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {siteReviews.map((review) => (
              <div key={review.id} className="px-4 py-4 flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StarRating rating={review.rating} />
                    <Badge variant="default">Home page</Badge>
                  </div>
                  <p className="text-sm text-[var(--muted)] italic">&ldquo;{review.body}&rdquo;</p>
                  <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                    <span>
                      By:{" "}
                      <span className="font-medium text-[var(--foreground)]">{review.reviewerName}</span>
                    </span>
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                <DeleteButton
                  reviewId={review.id}
                  actionId={actionId}
                  confirmDeleteId={confirmDeleteId}
                  onConfirm={() => setConfirmDeleteId(review.id)}
                  onCancel={() => setConfirmDeleteId(null)}
                  onDelete={() => handleDeleteSite(review.id)}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
