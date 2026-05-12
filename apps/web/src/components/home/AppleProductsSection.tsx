import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProductsByBrandSlug } from "@icrowed/database/queries";
import { ProductCard } from "@/components/products/ProductCard";
import type { ProductCardData } from "@/components/products/ProductCard";

/** Unified card treatment inside the Apple strip */
const APPLE_CARD_TINT = "from-neutral-800 to-neutral-950";

interface DbImage {
  isPrimary?: boolean;
  url: string;
}

function mapRow(
  p: Awaited<ReturnType<typeof getProductsByBrandSlug>>[number],
): ProductCardData {
  const imgs = p.images as DbImage[] | null | undefined;
  const brand = (p as { brand?: { name?: string } | null }).brand;
  const category = (p as { category?: { name?: string } | null }).category;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
    imageUrl: imgs?.find((i) => i.isPrimary)?.url ?? imgs?.[0]?.url,
    stock: p.stock,
    color: APPLE_CARD_TINT,
    badge: p.comparePrice ? "Sale" : undefined,
    brand: brand?.name,
    category: category?.name,
  };
}

function SectionChrome({
  children,
  hasProducts,
}: Readonly<{
  children: ReactNode;
  hasProducts: boolean;
}>) {
  return (
    <section className="px-3 sm:px-5 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200/90 bg-gradient-to-b from-neutral-50 via-white to-zinc-50/80 shadow-[0_24px_60px_rgba(0,0,0,0.06)]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-neutral-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-zinc-300/25 blur-3xl" />

        <div className="relative px-5 sm:px-8 pt-8 pb-6 sm:pt-10 sm:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-neutral-900 flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" aria-hidden>
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-1">
                  Apple Store
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                  iPhone & more
                </h2>
                <p className="text-sm text-neutral-500 mt-1 max-w-md leading-relaxed">
                  Genuine Apple devices with warranty-friendly pricing for Sri Lanka.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Link
                href="/products/brands/apple"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-neutral-800"
              >
                Shop Apple
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/products?brand=apple"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white/80 px-4 py-2.5 text-xs font-semibold text-neutral-700 backdrop-blur-sm transition hover:border-neutral-400 hover:bg-white"
              >
                All Apple · filters
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </div>

          {hasProducts ? (
            children
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-5 py-10 text-center">
              <p className="text-sm font-semibold text-neutral-800">
                No Apple products in the database yet, or the app cannot reach Postgres.
              </p>
              <p className="text-xs text-neutral-500 mt-2 max-w-lg mx-auto leading-relaxed">
                Run{" "}
                <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px]">
                  npm run db:seed -w @icrowed/database
                </code>{" "}
                (loads from <code className="font-mono text-[11px]">apps/web/.env.local</code> first) to insert the Apple
                brand and iPhones. Ensure <code className="font-mono text-[11px]">DATABASE_URL</code> is set in{" "}
                <code className="font-mono text-[11px]">apps/web/.env.local</code> so this page can read products.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export async function AppleProductsSection() {
  let rows: Awaited<ReturnType<typeof getProductsByBrandSlug>> = [];
  try {
    rows = await getProductsByBrandSlug("apple", { limit: 8 });
  } catch {
    rows = [];
  }

  const cards = rows.map(mapRow);
  const hasProducts = cards.length > 0;

  return (
    <SectionChrome hasProducts={hasProducts}>
      {hasProducts ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {cards.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}
    </SectionChrome>
  );
}
