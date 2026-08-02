import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getBrandBySlug,
  getBrands,
  getCategories,
  getProductsByBrandSlug,
  getReviewSummariesForProducts,
} from "@icrowd/database/queries";
import { ProductsClient } from "../../ProductsClient";
import { queryStorefront } from "@/lib/storefront-query";
import { mapProductToCardData } from "@/lib/product-card-map";
import { absoluteUrl, buildPageMetadata, serializeJsonLd } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await queryStorefront("brand-meta", () => getBrandBySlug(slug)).catch(
    () => null,
  );
  if (!brand) return buildPageMetadata({ title: "Brand", path: `/products/brands/${slug}` });
  const description =
    brand.description?.trim() ||
    `Buy ${brand.name} in Sri Lanka — prices, warranty, island-wide delivery, and pickup in Kandy, Kottawa & Matara at iCrowd.`;
  return buildPageMetadata({
    title: `Buy ${brand.name} in Sri Lanka`,
    description,
    path: `/products/brands/${slug}`,
    image: brand.logoUrl,
  });
}

export default async function BrandProductsPage({ params }: Props) {
  const { slug } = await params;
  const brand = await queryStorefront("brand", () => getBrandBySlug(slug));
  if (!brand) notFound();

  const [dbProducts, brandRows, categoryRows] = await Promise.all([
    queryStorefront("brand-products", () => getProductsByBrandSlug(slug, { limit: 200 })),
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

  const intro =
    brand.description?.trim() ||
    `Shop genuine ${brand.name} products at iCrowd Sri Lanka. Compare prices in LKR, check warranty on each product page, and choose island-wide delivery or pickup in Kandy, Kottawa, and Matara.`;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${brand.name} products — iCrowd Sri Lanka`,
    description: intro,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/products/${p.slug}`),
      name: p.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListJsonLd) }}
      />
      <Suspense fallback={<div className="bento-bg min-h-screen" />}>
        <ProductsClient
          products={products}
          brandFilterNames={brandFilterNames}
          brandFilterOptions={brandFilterOptions}
          categoryFilterOptions={categoryFilterOptions}
          initialBrand={brand.name}
          listTitle={brand.name}
        />
      </Suspense>
    </>
  );
}
