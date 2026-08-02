import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getBrands,
  getCategories,
  getCategoryBySlug,
  getProductsByCategorySlug,
  getReviewSummariesForProducts,
} from "@icrowd/database/queries";
import { ProductsClient } from "@/app/(store)/products/ProductsClient";
import { queryStorefront } from "@/lib/storefront-query";
import { mapProductToCardData } from "@/lib/product-card-map";
import { absoluteUrl, buildPageMetadata, serializeJsonLd } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await queryStorefront("category-meta", () => getCategoryBySlug(slug)).catch(
    () => null,
  );
  if (!category) {
    return buildPageMetadata({ title: "Category", path: `/categories/${slug}` });
  }
  const description =
    category.description?.trim() ||
    `Shop ${category.name} in Sri Lanka at iCrowd — genuine products, island-wide delivery, and pickup in Kandy, Kottawa & Matara.`;
  return buildPageMetadata({
    title: `${category.name} in Sri Lanka`,
    description,
    path: `/categories/${slug}`,
    image: category.imageUrl,
  });
}

export default async function CategoryLandingPage({ params }: Props) {
  const { slug } = await params;
  const category = await queryStorefront("category", () => getCategoryBySlug(slug));
  if (!category) notFound();

  const [dbProducts, brandRows, categoryRows] = await Promise.all([
    queryStorefront("category-products", () =>
      getProductsByCategorySlug(slug, { limit: 200 }),
    ),
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
    category.description?.trim() ||
    `Browse ${category.name} at iCrowd Sri Lanka. Island-wide delivery and pickup available in Kandy, Kottawa, and Matara.`;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} — iCrowd Sri Lanka`,
    description: intro,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/products/${p.slug}`),
      name: p.name,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: absoluteUrl("/categories"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: absoluteUrl(`/categories/${slug}`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <Suspense fallback={<div className="bento-bg min-h-screen" />}>
        <ProductsClient
          products={products}
          brandFilterNames={brandFilterNames}
          brandFilterOptions={brandFilterOptions}
          categoryFilterOptions={categoryFilterOptions}
          listTitle={category.name}
          lockCategorySlug={slug}
        />
      </Suspense>
    </>
  );
}
