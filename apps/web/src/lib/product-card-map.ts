import type { ProductCardData } from "@/components/products/ProductCard";
import { normalizeProductImageUrl } from "@/lib/product-image-url";

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

export function productCardColor(id: string): string {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return CARD_GRADIENTS[hash % CARD_GRADIENTS.length];
}

export function primaryProductCardImage(images: unknown): string | undefined {
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

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  comparePrice?: string | number | null;
  stock: number;
  isFeatured?: boolean | null;
  warranty?: string | null;
  images?: unknown;
  brand?: { name?: string } | null;
  brandId?: string | null;
  category?: { slug?: string } | null;
};

export function mapProductToCardData(
  p: ProductRow,
  opts?: {
    brandById?: Map<string, string>;
    reviewStats?: { rating: number; reviewCount: number };
  },
): ProductCardData {
  const brandName =
    p.brand?.name ?? (p.brandId && opts?.brandById ? opts.brandById.get(p.brandId) : undefined);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
    imageUrl: primaryProductCardImage(p.images),
    stock: p.stock,
    color: productCardColor(p.id),
    badge: p.comparePrice ? "Sale" : undefined,
    brand: brandName,
    categorySlug: p.category?.slug,
    isFeatured: p.isFeatured ?? undefined,
    rating: opts?.reviewStats?.rating ?? 0,
    reviewCount: opts?.reviewStats?.reviewCount ?? 0,
    warranty: p.warranty ?? null,
  };
}
