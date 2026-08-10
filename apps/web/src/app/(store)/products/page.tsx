import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ProductsClient } from "./ProductsClient";
import { getBrands, getCategories, getProducts, getReviewSummariesForProducts } from "@icrowd/database/queries";
import { queryStorefront } from "@/lib/storefront-query";
import { mapProductToCardData } from "@/lib/product-card-map";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "All Products — Phones & Accessories Sri Lanka",
  description:
    "Browse iPhone price in Sri Lanka, Anker earbuds, chargers, power banks and accessories at iCrowd — genuine stock, Kandy shop, island-wide delivery.",
  path: "/products",
});

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const categorySlug = sp.category?.trim().toLowerCase();
  if (categorySlug) {
    redirect(`/categories/${encodeURIComponent(categorySlug)}`);
  }

  const [dbProducts, brandRows, categoryRows] = await Promise.all([
    queryStorefront("products-list", () => getProducts({ limit: 500 })),
    queryStorefront("brands", () => getBrands()),
    queryStorefront("categories", () => getCategories()),
  ]);

  const brandFilterNames = brandRows.map((b) => b.name);
  const brandFilterOptions = brandRows.map((b) => ({
    name: b.name,
    slug: b.slug,
    logoUrl: b.logoUrl ?? null,
  }));
  const categoryFilterOptions = categoryRows.map((c) => ({ slug: c.slug, name: c.name }));
  const brandById = new Map(brandRows.map((b) => [b.id, b.name]));

  const reviewSummaries = await getReviewSummariesForProducts(dbProducts.map((p) => p.id)).catch(
    () => new Map<string, { rating: number; reviewCount: number }>(),
  );

  const products = dbProducts.map((p) =>
    mapProductToCardData(p, {
      brandById,
      reviewStats: reviewSummaries.get(p.id),
    }),
  );

  return (
    <Suspense fallback={<div className="bento-bg min-h-screen" />}>
      <ProductsClient
        products={products}
        brandFilterNames={brandFilterNames}
        brandFilterOptions={brandFilterOptions}
        categoryFilterOptions={categoryFilterOptions}
      />
    </Suspense>
  );
}

