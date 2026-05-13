import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Shield, Truck, RefreshCw, Star,
  ChevronRight, SlidersHorizontal,
} from "lucide-react";
import { ProductDetailClient } from "./ProductDetailClient";
import { ProductImages } from "./ProductImages";
import { ProductReviews } from "./ProductReviews";
import { getProductBySlug } from "@icrowed/database/queries";

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

function productGradient(id: string): string {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return CARD_GRADIENTS[hash % CARD_GRADIENTS.length];
}

function mapSpecifications(
  specs: Record<string, unknown> | null | undefined,
): { group: string; specs: { label: string; value: string }[] }[] {
  if (!specs || typeof specs !== "object") return [];
  const entries = Object.entries(specs).map(([label, value]) => ({
    label,
    value: String(value),
  }));
  if (entries.length === 0) return [];
  return [{ group: "Specifications", specs: entries }];
}

async function getProduct(slug: string) {
  const p = await getProductBySlug(slug).catch(() => null);
  if (!p) return null;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    stock: p.stock,
    description: p.description ?? p.shortDescription ?? "",
    specifications: mapSpecifications(p.specifications as Record<string, unknown> | null),
    rating: 0,
    reviewCount: 0,
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
  return { title: `${product.name} | iCrowed` };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <div className="bento-bg min-h-screen">
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

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
              </div>
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

            {/* Trust strip */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
              {[
                { Icon: Truck,      label: "Free Delivery",     sub: "Over LKR 5,000" },
                { Icon: Shield,     label: "Official Warranty", sub: "Manufacturer" },
                { Icon: RefreshCw,  label: "7-day Returns",     sub: "Hassle-free" },
              ].map(({ Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1 p-3 bg-gray-50 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-800">{label}</span>
                  <span className="text-[10px] text-gray-400">{sub}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
              {product.description}
            </p>
          </div>
        </div>

        {/* ── Specifications ──────────────────────────────────────────────── */}
        {product.specifications.length > 0 && (
          <div className="bento-card p-5 sm:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
                <SlidersHorizontal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Specifications</h2>
                <p className="text-xs text-gray-400 mt-0.5">Full technical details</p>
              </div>
            </div>

            {product.specifications.map((group) => (
              <div key={group.group}>
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="group flex flex-col gap-2 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-sm transition-all duration-200"
                    >
                      <dt className="text-[10px] font-extrabold tracking-widest text-gray-400 uppercase group-hover:text-indigo-500 transition-colors leading-none">
                        {spec.label}
                      </dt>
                      <dd className="text-sm font-bold text-gray-900 leading-snug">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        )}

        {/* ── Reviews ─────────────────────────────────────────────────────── */}
        <ProductReviews productId={product.id} />

      </div>
    </div>
  );
}
