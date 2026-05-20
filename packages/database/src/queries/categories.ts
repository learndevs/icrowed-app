import { eq, and, asc, inArray } from "drizzle-orm";
import { db } from "../db";
import { categories, brands } from "../schema";

/** Top nav / home showcase — must match `CATEGORIES` seed slugs. */
export const STOREFRONT_CATEGORY_SLUGS = [
  "phones",
  "earbuds",
  "ipads",
  "macbooks",
  "charging-adapters",
  "powerbanks",
  "wireless-mics",
  "speakers",
  "headphones",
  "gimbals",
] as const;

export type StorefrontCategorySlug = (typeof STOREFRONT_CATEGORY_SLUGS)[number];

export async function getStorefrontCategories() {
  const rows = await db
    .select()
    .from(categories)
    .where(and(eq(categories.isActive, true), inArray(categories.slug, [...STOREFRONT_CATEGORY_SLUGS])))
    .orderBy(asc(categories.sortOrder));

  const order = new Map<string, number>(STOREFRONT_CATEGORY_SLUGS.map((s, i) => [s, i]));
  return [...rows].sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99));
}

export async function getCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder));
}

export async function getAllCategories() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getCategoryById(id: string) {
  const [cat] = await db.select().from(categories).where(eq(categories.id, id));
  return cat ?? null;
}

export async function getCategoryBySlug(slug: string) {
  const [cat] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.slug, slug), eq(categories.isActive, true)));
  return cat ?? null;
}

export async function createCategory(
  data: Omit<typeof categories.$inferInsert, "id" | "createdAt" | "updatedAt">
) {
  const [category] = await db.insert(categories).values(data).returning();
  return category;
}

export async function updateCategory(
  id: string,
  data: Partial<typeof categories.$inferInsert>
) {
  const [category] = await db
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  return category;
}

export async function deleteCategory(id: string) {
  const [category] = await db
    .update(categories)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  return category;
}

// ─── Brands ───────────────────────────────────────────────────────────────────
export async function getBrands() {
  return db
    .select()
    .from(brands)
    .where(eq(brands.isActive, true))
    .orderBy(asc(brands.name));
}

export async function getAllBrands() {
  return db.select().from(brands).orderBy(asc(brands.name));
}

export async function getBrandById(id: string) {
  const [brand] = await db.select().from(brands).where(eq(brands.id, id));
  return brand ?? null;
}

export async function getBrandBySlug(slug: string) {
  const [brand] = await db
    .select()
    .from(brands)
    .where(and(eq(brands.slug, slug), eq(brands.isActive, true)));
  return brand ?? null;
}

export async function createBrand(
  data: Omit<typeof brands.$inferInsert, "id" | "createdAt">
) {
  const [brand] = await db.insert(brands).values(data).returning();
  return brand;
}

export async function updateBrand(
  id: string,
  data: Partial<typeof brands.$inferInsert>
) {
  const [brand] = await db
    .update(brands)
    .set(data)
    .where(eq(brands.id, id))
    .returning();
  return brand;
}

export async function deleteBrand(id: string) {
  const [brand] = await db
    .update(brands)
    .set({ isActive: false })
    .where(eq(brands.id, id))
    .returning();
  return brand;
}
