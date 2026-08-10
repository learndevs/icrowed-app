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
import { absoluteUrl, buildFaqJsonLd, buildPageMetadata, serializeJsonLd } from "@/lib/seo";
import { buildPriceListData, formatLkr } from "@/lib/price-list";

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
    (slug === "phones"
      ? "iPhone price in Sri Lanka — shop iPhone 17 Pro Max, 16 Pro Max and more at iCrowd. Genuine Apple phones, live LKR pricing, Kandy shop and island-wide delivery."
      : `Shop ${category.name} in Sri Lanka at iCrowd — genuine products, island-wide delivery, and pickup in Kandy, Kottawa & Matara.`);
  return buildPageMetadata({
    title:
      slug === "phones" ? "iPhones & Phones Price in Sri Lanka" : `${category.name} in Sri Lanka`,
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

  const priceList = buildPriceListData(dbProducts);
  const faqs = priceList
    ? [
        {
          question: `What is the ${category.name} price in Sri Lanka?`,
          answer: `${category.name} prices at iCrowd currently range from ${formatLkr(priceList.priceMin)} to ${formatLkr(priceList.priceMax)}, depending on the model. See the price list above or open any product for its current price.`,
        },
        {
          question: `Do you deliver ${category.name} island-wide?`,
          answer: `Yes. We deliver ${category.name} across Sri Lanka, with pickup also available at our Kandy shop and our Kottawa and Matara pickup points.`,
        },
        {
          question: `Are your ${category.name} genuine with warranty?`,
          answer: `Yes, all products are genuine and backed by manufacturer warranty. Warranty details are listed on each product page.`,
        },
      ]
    : [];

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
      {faqs.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildFaqJsonLd(faqs)) }}
        />
      ) : null}
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
