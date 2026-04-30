import { eq, ilike, and, desc, sql, count } from "drizzle-orm";
import { db } from "../db";
import { products, productImages, productVariants, categories, brands } from "../schema";

export async function getProducts(opts?: {
  categoryId?: string;
  brandId?: string;
  search?: string;
  isFeatured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const conditions = [eq(products.isActive, true)];
  if (opts?.categoryId) conditions.push(eq(products.categoryId, opts.categoryId));
  if (opts?.brandId) conditions.push(eq(products.brandId, opts.brandId));
  if (opts?.isFeatured !== undefined)
    conditions.push(eq(products.isFeatured, opts.isFeatured));
  if (opts?.search)
    conditions.push(ilike(products.name, `%${opts.search}%`));

  return db.query.products.findMany({
    where: and(...conditions),
    with: { images: true, category: true, brand: true },
    orderBy: [desc(products.createdAt)],
    limit: opts?.limit ?? 20,
    offset: opts?.offset ?? 0,
  });
}

export async function getProductsAdmin(opts?: {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}) {
  const conditions: ReturnType<typeof eq>[] = [];
  if (opts?.search) conditions.push(ilike(products.name, `%${opts.search}%`));
  if (opts?.categoryId) conditions.push(eq(products.categoryId, opts.categoryId));
  if (opts?.isActive !== undefined) conditions.push(eq(products.isActive, opts.isActive));

  const where = conditions.length ? and(...conditions) : undefined;
  const [rows, totals] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        price: products.price,
        comparePrice: products.comparePrice,
        stock: products.stock,
        lowStockThreshold: products.lowStockThreshold,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        categoryId: products.categoryId,
        categoryName: categories.name,
        brandId: products.brandId,
        brandName: brands.name,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(where)
      .orderBy(desc(products.createdAt))
      .limit(opts?.limit ?? 20)
      .offset(opts?.offset ?? 0),
    db.select({ total: count() }).from(products).where(where),
  ]);
  return { rows, total: totals[0]?.total ?? 0 };
}

export async function getProductBySlug(slug: string) {
  return db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isActive, true)),
    with: {
      images: true,
      variants: true,
      category: true,
      brand: true,
    },
  });
}

export async function createProduct(
  data: Omit<typeof products.$inferInsert, "id" | "createdAt" | "updatedAt">
) {
  const [product] = await db.insert(products).values(data).returning();
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<typeof products.$inferInsert>
) {
  const [product] = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  return product;
}

export async function deleteProduct(id: string) {
  const [product] = await db
    .update(products)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  return product;
}
