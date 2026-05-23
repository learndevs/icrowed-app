import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { deliveryTypes } from "../schema";
import { getOrCreateShippingRates } from "./shippingRates";

export type DeliveryTypeRow = typeof deliveryTypes.$inferSelect;

export function computeDeliveryFee(opts: {
  priceLkr: number;
  eligibleForFreeShipping: boolean;
  subtotal: number;
  freeShippingMinSubtotal: number;
}): number {
  if (opts.eligibleForFreeShipping && opts.subtotal >= opts.freeShippingMinSubtotal) {
    return 0;
  }
  return opts.priceLkr;
}

export async function getActiveDeliveryTypes() {
  return db.query.deliveryTypes.findMany({
    where: eq(deliveryTypes.isActive, true),
    orderBy: [asc(deliveryTypes.sortOrder), asc(deliveryTypes.name)],
  });
}

export async function getAllDeliveryTypes() {
  return db.query.deliveryTypes.findMany({
    orderBy: [asc(deliveryTypes.sortOrder), asc(deliveryTypes.name)],
  });
}

export async function getDeliveryTypeById(id: string) {
  return db.query.deliveryTypes.findFirst({
    where: eq(deliveryTypes.id, id),
  });
}

export async function getCheckoutDeliveryOptions() {
  const [types, rates] = await Promise.all([
    getActiveDeliveryTypes(),
    getOrCreateShippingRates(),
  ]);

  return {
    freeShippingMinSubtotal: Number(rates.freeShippingMinSubtotal),
    types: types.map((type) => ({
      id: type.id,
      name: type.name,
      slug: type.slug,
      description: type.description,
      priceLkr: Number(type.priceLkr),
      eligibleForFreeShipping: type.eligibleForFreeShipping,
      sortOrder: type.sortOrder,
    })),
  };
}

export async function computeDeliveryFeeForType(
  deliveryTypeId: string,
  subtotal: number,
): Promise<{ fee: number; type: DeliveryTypeRow } | null> {
  const type = await getDeliveryTypeById(deliveryTypeId);
  if (!type || !type.isActive) return null;

  const rates = await getOrCreateShippingRates();
  const fee = computeDeliveryFee({
    priceLkr: Number(type.priceLkr),
    eligibleForFreeShipping: type.eligibleForFreeShipping,
    subtotal,
    freeShippingMinSubtotal: Number(rates.freeShippingMinSubtotal),
  });

  return { fee, type };
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export async function createDeliveryType(data: {
  name: string;
  slug?: string;
  description?: string | null;
  priceLkr: number;
  eligibleForFreeShipping?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const [row] = await db
    .insert(deliveryTypes)
    .values({
      name: data.name.trim(),
      slug: data.slug?.trim() || slugify(data.name),
      description: data.description?.trim() || null,
      priceLkr: String(data.priceLkr),
      eligibleForFreeShipping: data.eligibleForFreeShipping ?? false,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    })
    .returning();
  return row;
}

export async function updateDeliveryType(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string | null;
    priceLkr: number;
    eligibleForFreeShipping: boolean;
    sortOrder: number;
    isActive: boolean;
  }>,
) {
  const patch: Partial<typeof deliveryTypes.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) patch.name = data.name.trim();
  if (data.slug !== undefined) patch.slug = data.slug.trim();
  if (data.description !== undefined) patch.description = data.description?.trim() || null;
  if (data.priceLkr !== undefined) patch.priceLkr = String(data.priceLkr);
  if (data.eligibleForFreeShipping !== undefined) {
    patch.eligibleForFreeShipping = data.eligibleForFreeShipping;
  }
  if (data.sortOrder !== undefined) patch.sortOrder = data.sortOrder;
  if (data.isActive !== undefined) patch.isActive = data.isActive;

  const [row] = await db
    .update(deliveryTypes)
    .set(patch)
    .where(eq(deliveryTypes.id, id))
    .returning();
  return row;
}

export async function deleteDeliveryType(id: string) {
  const [row] = await db
    .update(deliveryTypes)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(deliveryTypes.id, id))
    .returning();
  return row;
}
