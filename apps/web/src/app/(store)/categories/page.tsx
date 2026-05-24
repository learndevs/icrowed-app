import type { Metadata } from "next";
import { getStorefrontCategories } from "@icrowd/database/queries";
import { CategoryShowcaseGrid, categoryRowToShowcaseItem } from "@/components/home/CategoryShowcaseGrid";

export const metadata: Metadata = { title: "Categories | iCrowd" };

export const revalidate = 600;

export default async function CategoriesPage() {
  const rows = await getStorefrontCategories().catch(() => []);
  const items = rows.map(categoryRowToShowcaseItem);

  return (
    <div className="min-h-screen bg-white">
      <div className="px-3 sm:px-5 lg:px-8 py-6 max-w-[1400px] mx-auto">
        <div className="mb-6">
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
      </div>
    </div>
  );
}
