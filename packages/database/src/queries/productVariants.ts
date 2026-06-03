import { eq, and, notInArray } from "drizzle-orm";
import { db } from "../db";
import { productVariants } from "../schema";

export type ProductVariantInput = {
  id?: string;
  name: string;
  sku?: string | null;
  price?: string | null;
  stock: number;
  options?: Record<string, unknown> | null;
  isActive?: boolean;
  sortOrder?: number;
};

export async function listVariantsForProduct(productId: string) {
  return db.query.productVariants.findMany({
    where: eq(productVariants.productId, productId),
    orderBy: (v, { asc }) => [asc(v.sortOrder), asc(v.name)],
  });
}

/**
 * Replace variant set for a product: updates by id, inserts rows without id, deletes missing ids.
 */
export async function syncProductVariants(productId: string, rows: ProductVariantInput[]) {
  await db.transaction(async (tx) => {
    const incomingIds = rows.map((r) => r.id).filter(Boolean) as string[];

    if (incomingIds.length === 0) {
      await tx.delete(productVariants).where(eq(productVariants.productId, productId));
    } else {
      await tx
        .delete(productVariants)
        .where(
          and(eq(productVariants.productId, productId), notInArray(productVariants.id, incomingIds)),
        );
    }

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]!;
      const base = {
        productId,
        name: r.name,
        sku: r.sku ?? null,
        price: r.price != null && r.price !== "" ? String(r.price) : null,
        stock: r.stock,
        options: r.options ?? null,
        isActive: r.isActive ?? true,
        sortOrder: r.sortOrder ?? i,
      };
      if (r.id) {
        await tx.update(productVariants).set(base).where(eq(productVariants.id, r.id));
      } else {
        await tx.insert(productVariants).values(base);
      }
    }
  });
}
