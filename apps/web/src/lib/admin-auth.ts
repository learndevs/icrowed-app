import "server-only";

import { db, profiles } from "@icrowd/database";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/session";

export type StaffRole = "admin" | "operator";

export type VerifiedStaff = {
  userId: string;
  email: string;
  role: StaffRole;
};

/** Current staff member from the Better Auth session; role is re-read from Postgres. */
export async function getStaffFromSession(): Promise<VerifiedStaff | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const [profile] = await db
    .select({ role: profiles.role, email: profiles.email, isActive: profiles.isActive })
    .from(profiles)
    .where(eq(profiles.id, user.id));

  if (!profile?.isActive) return null;
  if (profile.role !== "admin" && profile.role !== "operator") return null;

  return { userId: user.id, email: profile.email, role: profile.role };
}
