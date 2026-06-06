import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getBrandBySlug, getBrands, getCategories, getProductsByBrandSlug, getReviewSummariesForProducts } from "@icrowd/database/queries";
import { ProductsClient } from "../../ProductsClient";
import type { ProductCardData } from "@/components/products/ProductCard";
import { queryStorefront } from "@/lib/storefront-query";
import { normalizeProductImageUrl } from "@/lib/product-image-url";
import { buildPageMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

const CARD_GRADIENTS = [
  "from-sky-400 to-sky-600",
  "from-gray-700 to-gray-900",
  "from-teal-500 to-emerald-600",
  "from-rose-500 to-red-600",
  "from-orange-500 to-amber-600",
  "from-cyan-400 to-sky-600",
  "from-sky-500 to-cyan-500",
  "from-pink-500 to-rose-600",
] as const;

function productColor(id: string): string {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return CARD_GRADIENTS[hash % CARD_GRADIENTS.length];
}

function primaryImageUrl(images: unknown): string | undefined {
  if (!Array.isArray(images)) return undefined;
  const rows = images as { url?: string; sortOrder?: number; isPrimary?: boolean }[];
  const valid = rows.filter((img) => typeof img?.url === "string" && img.url.length > 0);
  if (valid.length === 0) return undefined;
  const primary = valid.find((img) => img.isPrimary);
  if (primary?.url) return normalizeProductImageUrl(primary.url);
  const sorted = [...valid].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const url = sorted[0]?.url;
  return url ? normalizeProductImageUrl(url) : undefined;
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await queryStorefront("brand-meta", () => getBrandBySlug(slug)).catch(
    () => null,
  );
  if (!brand) return buildPageMetadata({ title: "Brand", path: `/products/brands/${slug}` });
  return buildPageMetadata({
    title: brand.name,
    description: `Shop ${brand.name} phones and accessories at iCrowd Sri Lanka.`,
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

  const products: ProductCardData[] = dbProducts.map((p) => {
    const row = p as {
      brand?: { name?: string } | null;
      brandId?: string | null;
      category?: { slug?: string } | null;
    };
    const brandName =
      row.brand?.name ?? (row.brandId ? brandById.get(row.brandId) : undefined);
    const reviewStats = reviewSummaries.get(p.id);
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
      imageUrl: primaryImageUrl(p.images),
      stock: p.stock,
      color: productColor(p.id),
      badge: p.comparePrice ? "Sale" : undefined,
      brand: brandName,
      categorySlug: row.category?.slug,
      rating: reviewStats?.rating ?? 0,
      reviewCount: reviewStats?.reviewCount ?? 0,
      warranty: p.warranty ?? null,
    };
  });

  return (
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
  );
}
