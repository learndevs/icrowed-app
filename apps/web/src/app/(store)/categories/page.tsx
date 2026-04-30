import type { Metadata } from "next";
import { getCategories, getBrands } from "@icrowed/database/queries";
import { CategoriesView } from "./CategoriesView";

export const metadata: Metadata = {
  title: "Categories & Brands | iCrowed",
  description:
    "Browse categories and brands — phones, drones, audio, power banks, earbuds, and more. Managed from your admin catalog.",
};

export default async function CategoriesPage() {
  const [categoriesRaw, brandsRaw] = await Promise.all([
    getCategories().catch(() => []),
    getBrands().catch(() => []),
  ]);

  const categories = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    imageUrl: c.imageUrl ?? null,
  }));

  const brands = brandsRaw.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logoUrl: b.logoUrl ?? null,
  }));

  return <CategoriesView categories={categories} brands={brands} />;
}
