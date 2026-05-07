import { eq } from "drizzle-orm";
import { db } from "../db";
import { notificationPreferences } from "../schema";

export type NotificationPrefsRow = typeof notificationPreferences.$inferSelect;
export type NotificationPrefsInput = Partial<
  typeof notificationPreferences.$inferInsert
>;

export async function getOrCreateNotificationPrefs(): Promise<NotificationPrefsRow> {
  const rows = await db.select().from(notificationPreferences).limit(1);
  if (rows.length === 0) {
    const [created] = await db
      .insert(notificationPreferences)
      .values({})
      .returning();
    return created;
  }
  return rows[0];
}

export async function upsertNotificationPrefs(data: NotificationPrefsInput) {
  const existing = await db.select().from(notificationPreferences).limit(1);
  if (existing.length === 0) {
    const [row] = await db
      .insert(notificationPreferences)
      .values(data)
      .returning();
    return row;
  }
  const [row] = await db
    .update(notificationPreferences)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(notificationPreferences.id, existing[0].id))
    .returning();
  return row;
}

export function parseRecipients(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
