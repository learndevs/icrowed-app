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
import { absoluteUrl, buildFaqJsonLd, buildPageMetadata, serializeJsonLd } from "@/lib/seo";
import { buildBudgetTiers, buildListingTagChips, buildPriceListData, formatLkr } from "@/lib/price-list";
import { PriceListBlock } from "@/components/seo/PriceListBlock";
import { BudgetShelf } from "@/components/seo/BudgetShelf";
import { SeoFaqBlock } from "@/components/seo/SeoFaqBlock";
import { TagChips } from "@/components/seo/TagChips";

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

  const categoriesInBrand = Array.from(
    new Map(
      dbProducts
        .map((p) => p.category)
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
        .map((c) => [c.id, c]),
    ).values(),
  );

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

  const priceList = buildPriceListData(dbProducts);
  const budgetTiers = buildBudgetTiers(dbProducts.map((p) => Number(p.price)));
  const faqs = priceList
    ? [
        {
          question: `What is the ${brand.name} price in Sri Lanka?`,
          answer: `${brand.name} prices at iCrowd currently range from ${formatLkr(priceList.priceMin)} to ${formatLkr(priceList.priceMax)}, depending on the model. See the price list above or open any product for its current price.`,
        },
        {
          question: `Do you deliver ${brand.name} products island-wide?`,
          answer: `Yes. We deliver ${brand.name} across Sri Lanka, with pickup also available at our Kandy shop and our Kottawa and Matara pickup points.`,
        },
        {
          question: `Are your ${brand.name} products genuine with warranty?`,
          answer: `Yes, all ${brand.name} products we sell are genuine and backed by manufacturer warranty. Warranty details are listed on each product page.`,
        },
      ]
    : [];

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
          initialBrand={brand.name}
          listTitle={brand.name}
        />
      </Suspense>
      <div className="bento-bg">
        <div className="max-w-350 mx-auto px-3 pb-10 sm:px-5 lg:px-8">
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-zinc-600">{intro}</p>
          {priceList ? (
            <PriceListBlock heading={`${brand.name} Price List in Sri Lanka`} priceList={priceList} />
          ) : null}
          <BudgetShelf tiers={budgetTiers} basePath={`/products/brands/${slug}`} />
          <SeoFaqBlock faqs={faqs} />
          <TagChips
            tags={buildListingTagChips({
              listingName: brand.name,
              related: categoriesInBrand.map((c) => ({
                label: `${brand.name} ${c.name}`,
                href: `/categories/${c.slug}`,
              })),
            })}
          />
        </div>
      </div>
    </>
  );
}
