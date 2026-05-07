import { eq } from "drizzle-orm";
import { db } from "../db";
import { storeSettings } from "../schema";

export type StoreSettingsRow = typeof storeSettings.$inferSelect;
export type StoreSettingsInput = Partial<typeof storeSettings.$inferInsert>;

export async function getOrCreateStoreSettings(): Promise<StoreSettingsRow> {
  const rows = await db.select().from(storeSettings).limit(1);
  if (rows.length === 0) {
    const [created] = await db.insert(storeSettings).values({}).returning();
    return created;
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
