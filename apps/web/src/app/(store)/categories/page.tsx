import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { getStorefrontCategories } from "@icrowed/database/queries";
import { CategoryShowcaseGrid, categoryRowToShowcaseItem } from "@/components/home/CategoryShowcaseGrid";

export const metadata: Metadata = { title: "Categories | iCrowed" };

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const rows = await getStorefrontCategories().catch(() => []);
  const items = rows.map(categoryRowToShowcaseItem);

  return (
    <div className="bento-bg min-h-screen">
      <div className="px-3 sm:px-5 lg:px-8 py-6 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Tag className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">Browse</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">All Categories</h1>
          <p className="text-gray-400 text-sm mt-1">Find exactly what you&apos;re looking for</p>
        </div>

        {items.length === 0 ? (
          <div className="bento-card p-12 text-center">
            <p className="text-gray-400 text-sm">No categories available yet.</p>
          </div>
        ) : (
          <CategoryShowcaseGrid items={items} />
        )}

        <div className="mt-6 bento-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
          <div>
            <p className="font-black text-lg">Can&apos;t find what you&apos;re looking for?</p>
            <p className="text-indigo-200 text-sm mt-0.5">Browse all products in our full catalog</p>
          </div>
          <Link
            href="/products"
            className="shrink-0 inline-flex items-center gap-2 bg-lime-400 hover:bg-lime-500 text-gray-900 font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
