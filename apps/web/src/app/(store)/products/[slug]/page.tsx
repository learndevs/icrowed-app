import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  ChevronRight,
} from "lucide-react";
import { ProductDetailClient } from "./ProductDetailClient";
import { ProductImages } from "./ProductImages";
import { ProductReviews, type ProductReviewItem } from "./ProductReviews";
import {
  ProductRatingSummary,
  ProductReviewStatsProvider,
} from "./ProductReviewStatsContext";
import { ProductSpecifications } from "@/components/products/ProductSpecifications";
import { ProductShortDescription } from "@/components/products/ProductShortDescription";
import { ProductWarranty } from "@/components/products/ProductWarranty";
import { hasShortDescription } from "@/lib/short-description";
import { specificationsToMarkdown, hasSpecifications } from "@/lib/specifications";
import {
  getProductBySlug,
  getProductReviewSummary,
  getApprovedReviews,
} from "@icrowd/database/queries";
import { queryStorefront } from "@/lib/storefront-query";
import { normalizeProductImageUrl } from "@/lib/product-image-url";
import { absoluteUrl, buildPageMetadata, serializeJsonLd } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

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

function productGradient(id: string): string {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return CARD_GRADIENTS[hash % CARD_GRADIENTS.length];
}

/** Deduped per request — metadata + page share one DB round-trip. */
const getProductPageData = cache(async (slug: string) => {
  const p = await queryStorefront("product", () => getProductBySlug(slug));
  if (!p) return null;

  const [summary, reviewRows] = await Promise.all([
    getProductReviewSummary(p.id).catch(() => ({ reviewCount: 0, rating: 0 })),
    getApprovedReviews(p.id).catch(() => []),
  ]);

  const initialReviews: ProductReviewItem[] = reviewRows.map((review) => ({
    id: review.id,
    rating: review.rating,
    title: review.title,
    body: review.body,
    reviewerName: review.reviewerName,
    isVerifiedPurchase: review.isVerifiedPurchase,
    createdAt: review.createdAt.toISOString(),
    user: review.user
      ? { id: review.user.id, fullName: review.user.fullName }
      : null,
  }));

  const shortDescription = p.shortDescription ?? "";
  const description = p.description ?? "";

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku ?? "",
    price: Number(p.price),
    stock: p.stock,
    shortDescription,
    description,
    warranty: p.warranty ?? "",
    /** Features for bullet list — short desc first, else legacy full desc */
    featureBullets: shortDescription.trim() || description.trim(),
    showFullDescription: Boolean(
      shortDescription.trim() &&
        description.trim() &&
        description.trim() !== shortDescription.trim(),
    ),
    specificationsMarkdown: specificationsToMarkdown(p.specifications),
    hasSpecifications: hasSpecifications(p.specifications),
    rating: summary.rating,
    reviewCount: summary.reviewCount,
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
        sortOrder: v.sortOrder ?? 0,
      })),
    initialReviews,
  };
});

function primaryProductImage(images: { url: string; isPrimary: boolean }[]): string | null {
  const raw = images.find((i) => i.isPrimary)?.url ?? images[0]?.url ?? null;
  return raw ? normalizeProductImageUrl(raw) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductPageData(slug);
  if (!product) return {};
  const description =
    product.shortDescription.trim() ||
    product.description.trim().slice(0, 160) ||
    `Buy ${product.name} at iCrowd Sri Lanka.`;
  return buildPageMetadata({
    title: product.name,
    description,
    path: `/products/${slug}`,
    image: primaryProductImage(product.images),
  });
}

function productAvailability(product: {
  stock: number;
  variants: { stock: number }[];
}): string {
  const inStock =
    product.variants.length > 0
      ? product.variants.some((v) => v.stock > 0)
      : product.stock > 0;
  return inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductPageData(slug);
  if (!product) notFound();

  const productUrl = absoluteUrl(`/products/${slug}`);
  const imageUrl = primaryProductImage(product.images);
  const productDescription =
    product.shortDescription.trim() || product.description.trim() || product.name;

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: productDescription,
    ...(imageUrl ? { image: absoluteUrl(imageUrl) } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "LKR",
      price: product.price.toFixed(2),
      availability: productAvailability(product),
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
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
        name: "Products",
        item: absoluteUrl("/products"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <div className="bento-bg min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
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
                primaryImageUrl: (() => {
                  const raw =
                    product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url ?? null;
                  return raw ? normalizeProductImageUrl(raw) : null;
                })(),
              }}
            />

            {/* Feature highlights — bullet list */}
            {hasShortDescription(product.featureBullets) && (
              <ProductShortDescription text={product.featureBullets} />
            )}

            {/* Full description (when separate from short bullets) */}
            {product.showFullDescription && (
              <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                {product.description}
              </p>
            )}

            {product.warranty.trim() && (
              <ProductWarranty text={product.warranty} />
            )}
          </div>
        </div>

        {/* ── Specifications ──────────────────────────────────────────────── */}
        {product.hasSpecifications && (
          <ProductSpecifications markdown={product.specificationsMarkdown} />
        )}

        {/* ── Reviews ─────────────────────────────────────────────────────── */}
        <ProductReviews productId={product.id} initialReviews={product.initialReviews} />

      </div>
      </ProductReviewStatsProvider>
    </div>
  );
}
