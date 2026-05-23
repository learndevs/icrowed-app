import { eq } from "drizzle-orm";
import { db } from "../db";
import { storeSettings } from "../schema";

export type StoreSettingsRow = typeof storeSettings.$inferSelect;
export type StoreSettingsInput = Partial<typeof storeSettings.$inferInsert>;

const DEFAULT_BANK_DETAILS = {
  bankName: "Commercial Bank of Ceylon",
  accountName: "iCrowd (Pvt) Ltd",
  accountNumber: "8002-XXXXXXXX",
  branch: "Colombo 03",
  instructions:
    "Use your order number as the payment reference. Your order will be confirmed within 24 hours after we verify your deposit.",
};

export async function getOrCreateStoreSettings(): Promise<StoreSettingsRow> {
  const rows = await db.select().from(storeSettings).limit(1);
  if (rows.length === 0) {
    const [created] = await db
      .insert(storeSettings)
      .values({ bankDetails: DEFAULT_BANK_DETAILS })
      .returning();
    return created;
  }
  if (!rows[0].bankDetails) {
    const [updated] = await db
      .update(storeSettings)
      .set({ bankDetails: DEFAULT_BANK_DETAILS, updatedAt: new Date() })
      .where(eq(storeSettings.id, rows[0].id))
      .returning();
    return updated;
  }
  return rows[0];
}

export async function upsertStoreSettings(data: StoreSettingsInput) {
  const existing = await db.select().from(storeSettings).limit(1);
  if (existing.length === 0) {
    const [row] = await db.insert(storeSettings).values(data).returning();
    return row;
  }
  const [row] = await db
    .update(storeSettings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(storeSettings.id, existing[0].id))
    .returning();
  return row;
}
