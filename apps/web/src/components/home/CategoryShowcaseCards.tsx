import Link from "next/link";
import { getStorefrontCategories } from "@icrowed/database/queries";
import { CategoryShowcaseGrid, categoryRowToShowcaseItem } from "./CategoryShowcaseGrid";

/** Home: storefront categories from DB — image + name. */
export async function CategoryShowcaseCards() {
  const rows = await getStorefrontCategories().catch(() => []);
  const items = rows.map(categoryRowToShowcaseItem);
  if (items.length === 0) return null;

  return (
    <section className="px-3 sm:px-5 lg:px-8 py-5 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Categories</h2>
        <Link
          href="/categories"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          See more &rsaquo;
        </Link>
      </div>
      <CategoryShowcaseGrid items={items} />
    </section>
  );
}
