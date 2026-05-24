import Link from "next/link";
import { getStorefrontCategories } from "@icrowd/database/queries";
import { CategoryShowcaseGrid, categoryRowToShowcaseItem } from "./CategoryShowcaseGrid";
import { queryStorefront } from "@/lib/storefront-query";

/** Home: storefront categories from DB — image + name. */
export async function CategoryShowcaseCards() {
  const rows = await queryStorefront("home-categories", () => getStorefrontCategories());
  const items = rows.map(categoryRowToShowcaseItem);
  if (items.length === 0) return null;

  return (
    <section className="bg-white py-5 sm:py-6">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-5 lg:px-8">
      <div className="mb-6 text-center">
        <h2 className="text-[2rem] sm:text-[2.25rem] font-bold leading-tight text-black">
          Categories
        </h2>
        <Link
          href="/categories"
          className="mt-2 inline-block text-base font-normal text-black hover:opacity-70 transition-opacity"
        >
          See more &rsaquo;
        </Link>
      </div>
      <CategoryShowcaseGrid items={items} />
      </div>
    </section>
  );
}
