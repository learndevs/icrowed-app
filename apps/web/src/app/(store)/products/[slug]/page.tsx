import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Shield, Truck, RefreshCw, Star,
  ChevronRight, Check,
} from "lucide-react";
import { ProductDetailClient } from "./ProductDetailClient";
import { ProductImages } from "./ProductImages";
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
    comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
    stock: p.stock,
    description: p.description ?? p.shortDescription ?? "",
    specifications: mapSpecifications(p.specifications as Record<string, unknown> | null),
    highlights: (p.tags ?? []).slice(0, 5),
    category: (p as any).category?.name ?? "",
    brand: (p as any).brand?.name ?? "",
    rating: 0,
    reviewCount: 0,
    gradient: productGradient(p.id),
    images: (p.images as { id: string; url: string; altText: string | null; isPrimary: boolean; sortOrder: number }[]) ?? [],
    variants: ((p as any).variants ?? [])
      .filter((v: any) => v.isActive !== false)
      .map((v: any) => ({ id: v.id, name: v.name, stock: v.stock ?? 0 })),
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

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  const fmt = (p: number) => "LKR " + p.toLocaleString("en-LK");

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
          <ProductImages
            images={product.images}
            productName={product.name}
            gradient={product.gradient}
            discount={discount}
            brand={product.brand}
          />

          {/* Right: product info */}
          <div className="bento-card p-5 sm:p-7 flex flex-col gap-5">

            {/* Brand + category */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                {product.category}
              </span>
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {product.brand}
              </span>
              {product.stock > 0 && product.stock <= 5 && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  Only {product.stock} left
                </span>
              )}
              {product.stock === 0 && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

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

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-gray-900">{fmt(product.price)}</span>
              {product.comparePrice && (
                <span className="text-base text-gray-400 line-through">{fmt(product.comparePrice)}</span>
              )}
              {discount && (
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                  Save {fmt(product.comparePrice! - product.price)}
                </span>
              )}
            </div>

            {/* Highlights */}
            <div className="flex flex-wrap gap-2">
              {product.highlights.map((h) => (
                <span key={h} className="flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                  <Check className="w-3 h-3 text-emerald-500 shrink-0" /> {h}
                </span>
              ))}
            </div>

            {/* Variants */}
            <ProductDetailClient product={{ id: product.id, stock: product.stock, variants: product.variants }} />

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
        <div className="bento-card p-5 sm:p-7">
          <h2 className="text-xl font-black text-gray-900 mb-6">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.specifications.map((group) => (
              <div key={group.group} className="rounded-2xl overflow-hidden border border-gray-100">
                {/* Group header */}
                <div className="bg-gray-900 px-4 py-2.5">
                  <p className="text-[11px] font-extrabold tracking-widest text-gray-300 uppercase">
                    {group.group}
                  </p>
                </div>
                {/* Rows */}
                <div className="divide-y divide-gray-50">
                  {group.specs.map((spec, i) => (
                    <div
                      key={spec.label}
                      className={`flex items-start px-4 py-3 gap-3 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}
                    >
                      <span className="w-36 shrink-0 text-xs font-semibold text-gray-400">
                        {spec.label}
                      </span>
                      <span className="text-xs font-bold text-gray-800 leading-relaxed">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
