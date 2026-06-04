import "server-only";

import { sql } from "drizzle-orm";
import {
  db,
  profiles,
  orders,
  reviews,
  orderStatusHistory,
} from "@icrowd/database";
import { eq } from "drizzle-orm";

export type DeleteUserResult =
  | { ok: true; email: string; role: string }
  | { ok: false; error: string; status: number };

/**
 * Permanently removes a user: unlinks orders/reviews, deletes auth + profile.
 * Addresses and wishlists cascade from profiles.
 */
export async function deleteUserById(userId: string): Promise<DeleteUserResult> {
  const [profile] = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      role: profiles.role,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  if (!profile) {
    return { ok: false, error: "User not found", status: 404 };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(orderStatusHistory)
        .set({ changedBy: null })
        .where(eq(orderStatusHistory.changedBy, userId));

      await tx
        .update(orders)
        .set({ userId: null })
        .where(eq(orders.userId, userId));

      await tx
        .update(reviews)
        .set({ userId: null })
        .where(eq(reviews.userId, userId));

      await tx.execute(sql`
        DELETE FROM auth.identities WHERE user_id = ${userId}::uuid
      `);
      await tx.execute(sql`
        DELETE FROM auth.users WHERE id = ${userId}::uuid
      `);

      await tx.delete(profiles).where(eq(profiles.id, userId));
    });

    return { ok: true, email: profile.email, role: profile.role };
  } catch (err) {
    console.error("[deleteUserById]", err);
    return { ok: false, error: "Failed to delete user", status: 500 };
  }
}
