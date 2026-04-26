import { eq } from "drizzle-orm";
import { db } from "../index";
import { profiles, addresses } from "../schema";

export async function getProfile(userId: string) {
  return db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
    with: { addresses: true },
  });
}

export async function upsertProfile(
  data: typeof profiles.$inferInsert
) {
  const [profile] = await db
    .insert(profiles)
    .values(data)
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        fullName: data.fullName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        updatedAt: new Date(),
      },
    })
    .returning();
  return profile;
}

export async function getAddresses(userId: string) {
  return db.query.addresses.findMany({
    where: eq(addresses.userId, userId),
  });
}
