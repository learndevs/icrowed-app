import Link from "next/link";
import { getTopSellingProducts } from "@icrowd/database/queries";
import {
  TopSellingProductCard,
  type TopSellingProductData,
} from "./TopSellingProductCard";

interface DbImage {
  isPrimary?: boolean;
  url: string;
  sortOrder?: number;
}

function primaryImage(imgs: DbImage[] | null | undefined): string | undefined {
  if (!imgs?.length) return undefined;
  const valid = imgs.filter((i) => i.url);
  if (!valid.length) return undefined;
  const hit = valid.find((i) => i.isPrimary);
  if (hit?.url) return hit.url;
  return [...valid].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0]?.url;
}

function mapRow(
  p: Awaited<ReturnType<typeof getTopSellingProducts>>[number],
): TopSellingProductData {
  const specs = p.specifications as { soldCount?: number } | null;
  const imgs = p.images as DbImage[] | null | undefined;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
    imageUrl: primaryImage(imgs ?? undefined),
    stock: p.stock,
    soldCount: specs?.soldCount,
  };
}

export async function TopSellingProductsSection() {
  let rows: Awaited<ReturnType<typeof getTopSellingProducts>> = [];
  try {
    rows = await getTopSellingProducts();
  } catch {
    rows = [];
  }

  const products = rows.map(mapRow);
  if (products.length === 0) return null;

  return (
    <section className="bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-5 lg:px-8">
      <div className="mb-5 text-center sm:text-left">
        <h2 className="type-section-title text-zinc-900">
          Top Selling Products
        </h2>
        <Link
          href="/products?featured=true"
          className="mt-1 inline-block type-link text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          See more &rsaquo;
        </Link>
      </div>

      {/* Mobile: 2 cols · Desktop: 5 columns × 2 rows (6 products) */}
      <div className="grid w-full max-md:grid-cols-2 max-md:gap-3 md:grid-cols-5 md:auto-rows-fr md:gap-4 md:[grid-template-columns:repeat(5,minmax(0,1fr))]">
        {products.map((product) => (
          <div key={product.id} className="min-w-0 w-full max-w-full">
            <TopSellingProductCard product={product} />
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
