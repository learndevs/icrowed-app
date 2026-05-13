import { getStorefrontCategories } from "@icrowed/database/queries";
import { CategoryShowcaseGrid, categoryRowToShowcaseItem } from "./CategoryShowcaseGrid";

/** Home: storefront categories from DB — image + name (same card shell as before). */
export async function CategoryShowcaseCards() {
  const rows = await getStorefrontCategories().catch(() => []);
  const items = rows.map(categoryRowToShowcaseItem);
  if (items.length === 0) return null;

  return (
    <section className="px-3 sm:px-5 lg:px-8 py-5 max-w-[1400px] mx-auto">
      <CategoryShowcaseGrid items={items} />
    </section>
  );
}
