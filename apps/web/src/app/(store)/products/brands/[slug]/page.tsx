import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getBrandBySlug, getBrands, getProductsByBrandSlug } from "@icrowed/database/queries";
import { ProductsClient } from "../../ProductsClient";
import type { ProductCardData } from "@/components/products/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

const CARD_GRADIENTS = [
  "from-indigo-500 to-blue-600",
  "from-gray-700 to-gray-900",
  "from-teal-500 to-emerald-600",
  "from-rose-500 to-red-600",
  "from-orange-500 to-amber-600",
  "from-violet-500 to-purple-600",
  "from-sky-500 to-cyan-600",
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
  if (primary?.url) return primary.url;
  const sorted = [...valid].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return sorted[0]?.url;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug).catch(() => null);
  if (!brand) return { title: "Brand | iCrowed" };
  return { title: `${brand.name} | iCrowed`, description: `Shop ${brand.name} products at iCrowed.` };
}

export default async function BrandProductsPage({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug).catch(() => null);
  if (!brand) notFound();

  const [dbProducts, brandRows] = await Promise.all([
    getProductsByBrandSlug(slug, { limit: 200 }).catch(() => []),
    getBrands().catch(() => []),
  ]);

  const brandFilterNames = brandRows.map((b) => b.name);
  const brandById = new Map(brandRows.map((b) => [b.id, b.name]));

  const products: ProductCardData[] = dbProducts.map((p) => {
    const row = p as {
      brand?: { name?: string } | null;
      brandId?: string | null;
    };
    const brandName =
      row.brand?.name ?? (row.brandId ? brandById.get(row.brandId) : undefined);
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
    };
  });

  return (
    <Suspense fallback={<div className="bento-bg min-h-screen" />}>
      <ProductsClient
        products={products}
        brandFilterNames={brandFilterNames}
        initialBrand={brand.name}
        listTitle={brand.name}
      />
    </Suspense>
  );
}
