import type { Metadata } from "next";
import { ProductsClient } from "./ProductsClient";
import type { ProductCardData } from "@/components/products/ProductCard";
import { getProducts } from "@icrowed/database/queries";

export const metadata: Metadata = { title: "All Products | iCrowed" };

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

export default async function ProductsPage() {
  const dbProducts = await getProducts({ limit: 500 }).catch(() => []);

  const products: ProductCardData[] = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
    imageUrl:
      (p.images as any[])?.find((img: any) => img.isPrimary)?.url ??
      (p.images as any[])?.[0]?.url,
    stock: p.stock,
    color: productColor(p.id),
    badge: p.comparePrice ? "Sale" : undefined,
    brand: (p as any).brand?.name as string | undefined,
    category: (p as any).category?.name as string | undefined,
  }));

  return <ProductsClient products={products} />;
}

