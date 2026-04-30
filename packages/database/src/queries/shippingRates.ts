import { eq } from "drizzle-orm";
import { db } from "../db";
import { shopShippingRates } from "../schema";

export type ShippingRatesRow = typeof shopShippingRates.$inferSelect;

export async function getOrCreateShippingRates(): Promise<ShippingRatesRow> {
  const rows = await db.select().from(shopShippingRates).limit(1);
  if (rows.length === 0) {
    const [created] = await db.insert(shopShippingRates).values({}).returning();
    return created;
  }
  return rows[0];
}

export async function upsertShippingRates(data: {
  standardLkr: string;
  expressLkr: string;
  freeShippingMinSubtotal: string;
}) {
  const existing = await db.select().from(shopShippingRates).limit(1);
  if (existing.length === 0) {
    const [row] = await db.insert(shopShippingRates).values(data).returning();
    return row;
  }
  const [row] = await db
    .update(shopShippingRates)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(shopShippingRates.id, existing[0].id))
    .returning();
  return row;
}

export function computeShippingLkr(opts: {
  delivery: "standard" | "express";
  subtotal: number;
  rates: Pick<ShippingRatesRow, "standardLkr" | "expressLkr" | "freeShippingMinSubtotal">;
}): number {
  if (opts.delivery === "express") return Number(opts.rates.expressLkr);
  const freeOver = Number(opts.rates.freeShippingMinSubtotal);
  if (opts.subtotal >= freeOver) return 0;
  return Number(opts.rates.standardLkr);
}
