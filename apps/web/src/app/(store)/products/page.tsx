import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsClient } from "./ProductsClient";
import type { ProductCardData } from "@/components/products/ProductCard";
import { getBrands, getProducts } from "@icrowed/database/queries";

export const metadata: Metadata = { title: "All Products | iCrowed" };

/** Always merge fresh catalog + brand list (sidebar brands are not only inferred from rows). */
export const dynamic = "force-dynamic";

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

export default async function ProductsPage() {
  const [dbProducts, brandRows] = await Promise.all([
    getProducts({ limit: 500 }).catch(() => []),
    getBrands().catch(() => []),
  ]);

  const brandFilterNames = brandRows.map((b) => b.name);
  const brandById = new Map(brandRows.map((b) => [b.id, b.name]));

  const products: ProductCardData[] = dbProducts.map((p) => {
    const row = p as {
      brand?: { name?: string } | null;
      brandId?: string | null;
      category?: { slug?: string } | null;
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
      categorySlug: row.category?.slug,
    };
  });

  return (
    <Suspense fallback={<div className="bento-bg min-h-screen" />}>
      <ProductsClient products={products} brandFilterNames={brandFilterNames} />
    </Suspense>
  );
}

