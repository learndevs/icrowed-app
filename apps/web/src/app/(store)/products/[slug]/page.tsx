import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
} from "lucide-react";
import { ProductDetailClient } from "./ProductDetailClient";
import { ProductImages } from "./ProductImages";
import { ProductReviews } from "./ProductReviews";
import {
  ProductRatingSummary,
  ProductReviewStatsProvider,
} from "./ProductReviewStatsContext";
import { ProductSpecifications } from "@/components/products/ProductSpecifications";
import { specificationsToMarkdown, hasSpecifications } from "@/lib/specifications";
import { getProductBySlug, getProductReviewSummary } from "@icrowd/database/queries";
import { queryStorefront } from "@/lib/storefront-query";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

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

function productGradient(id: string): string {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return CARD_GRADIENTS[hash % CARD_GRADIENTS.length];
}

async function getProduct(slug: string) {
  const p = await queryStorefront("product", () => getProductBySlug(slug));
  if (!p) return null;

  const { reviewCount, rating } = await getProductReviewSummary(p.id).catch(() => ({
    reviewCount: 0,
    rating: 0,
  }));

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    stock: p.stock,
    description: p.description ?? p.shortDescription ?? "",
    specificationsMarkdown: specificationsToMarkdown(p.specifications),
    hasSpecifications: hasSpecifications(p.specifications),
    rating,
    reviewCount,
    gradient: productGradient(p.id),
    images: (p.images as { id: string; url: string; altText: string | null; isPrimary: boolean; sortOrder: number }[]) ?? [],
    variants: ((p as any).variants ?? [])
      .filter((v: any) => v.isActive !== false)
      .map((v: any) => ({
        id: v.id,
        name: v.name,
        stock: v.stock ?? 0,
        price: v.price ? Number(v.price) : null,
        sku: v.sku ?? null,
        options: v.options ?? null,
      })),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return { title: `${product.name} | iCrowd` };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <div className="bento-bg min-h-screen">
      <ProductReviewStatsProvider
        productId={product.id}
        initialRating={product.rating}
        initialReviewCount={product.reviewCount}
      >
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-8 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-gray-700 transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* ── Top section: image + info ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

          {/* Left: images */}
          <div className="relative z-0">
            <ProductImages
              images={product.images}
              productName={product.name}
              gradient={product.gradient}
            />
          </div>

          {/* Right: product info */}
          <div className="bento-card relative z-10 p-5 sm:p-7 flex flex-col gap-5">

            {/* Stock (base SKU only — variant stock is in the buy box) */}
            {product.variants.length === 0 &&
              (product.stock > 0 && product.stock <= 5 ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    Only {product.stock} left
                  </span>
                </div>
              ) : product.stock === 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                    Out of Stock
                  </span>
                </div>
              ) : null)}

            {/* Name */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>

              <ProductRatingSummary />
            </div>

            <ProductDetailClient
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                stock: product.stock,
                variants: product.variants,
                primaryImageUrl: product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url ?? null,
              }}
            />

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
              {product.description}
            </p>
          </div>
        </div>

        {/* ── Specifications ──────────────────────────────────────────────── */}
        {product.hasSpecifications && (
          <ProductSpecifications markdown={product.specificationsMarkdown} />
        )}

        {/* ── Reviews ─────────────────────────────────────────────────────── */}
        <ProductReviews productId={product.id} />

      </div>
      </ProductReviewStatsProvider>
    </div>
  );
}
