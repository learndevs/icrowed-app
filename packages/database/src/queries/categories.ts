import { eq, and, asc } from "drizzle-orm";
import { db } from "../db";
import { categories, brands, products } from "../schema";

export async function getStorefrontCategories() {
  return getCategories();
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
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, id));
    if (!existing) return null;

    await tx
      .update(products)
      .set({ categoryId: null, updatedAt: new Date() })
      .where(eq(products.categoryId, id));

    await tx
      .update(categories)
      .set({ parentId: null, updatedAt: new Date() })
      .where(eq(categories.parentId, id));

    const [category] = await tx.delete(categories).where(eq(categories.id, id)).returning();
    return category ?? null;
  });
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
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: brands.id })
      .from(brands)
      .where(eq(brands.id, id));
    if (!existing) return null;

    await tx
      .update(products)
      .set({ brandId: null, updatedAt: new Date() })
      .where(eq(products.brandId, id));

    const [brand] = await tx.delete(brands).where(eq(brands.id, id)).returning();
    return brand ?? null;
  });
}
