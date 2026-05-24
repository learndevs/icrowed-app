"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Star } from "lucide-react";

type ReviewStats = { rating: number; reviewCount: number };

const ProductReviewStatsContext = createContext<{
  stats: ReviewStats;
  setStats: (stats: ReviewStats) => void;
} | null>(null);

export function ProductReviewStatsProvider({
  productId,
  initialRating,
  initialReviewCount,
  children,
}: {
  productId: string;
  initialRating: number;
  initialReviewCount: number;
  children: ReactNode;
}) {
  const [stats, setStats] = useState<ReviewStats>({
    rating: initialRating,
    reviewCount: initialReviewCount,
  });

  const value = useMemo(() => ({ stats, setStats }), [stats]);

  return (
    <ProductReviewStatsContext.Provider value={value}>
      <div data-product-id={productId}>{children}</div>
    </ProductReviewStatsContext.Provider>
  );
}

export function useProductReviewStats() {
  const ctx = useContext(ProductReviewStatsContext);
  if (!ctx) {
    throw new Error("useProductReviewStats must be used within ProductReviewStatsProvider");
  }
  return ctx;
}

export function ProductRatingSummary() {
  const { stats } = useProductReviewStats();

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.round(stats.rating)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-200 fill-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-700">
        {stats.reviewCount > 0 ? stats.rating.toFixed(1) : "0"}
      </span>
      <span className="text-sm text-gray-400">({stats.reviewCount} reviews)</span>
    </div>
  );
}
