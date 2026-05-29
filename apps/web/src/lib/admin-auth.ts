import "server-only";

import { sql } from "drizzle-orm";
import { db, profiles } from "@icrowd/database";
import { eq } from "drizzle-orm";
import {
  getAdminSessionFromCookies,
  type AdminSessionPayload,
} from "@/lib/admin-session";

export type StaffRole = "admin" | "operator";

export type VerifiedStaff = {
  userId: string;
  email: string;
  role: StaffRole;
};

/** Verify email/password against auth.users (bcrypt via pgcrypto) and profiles role. */
export async function verifyStaffCredentials(
  email: string,
  password: string,
): Promise<VerifiedStaff | null> {
  try {
    const result = await db.execute(sql`
      SELECT u.id AS id, p.email AS email, p.role AS role
      FROM auth.users u
      INNER JOIN profiles p ON p.id = u.id
      WHERE lower(u.email) = lower(${email})
        AND u.encrypted_password IS NOT NULL
        AND u.encrypted_password = crypt(${password}, u.encrypted_password)
        AND p.is_active = true
        AND p.role::text IN ('admin', 'operator')
      LIMIT 1
    `);

    const row = result.rows[0] as
      | { id: string; email: string; role: string }
      | undefined;
    if (!row) return null;
    if (row.role !== "admin" && row.role !== "operator") return null;

    return {
      userId: row.id,
      email: row.email,
      role: row.role as StaffRole,
    };
  } catch (err) {
    console.error("[verifyStaffCredentials]", err);
    return null;
  }
}

/** Load current staff from signed session cookie and re-check profile in Postgres. */
export async function getStaffFromSession(): Promise<VerifiedStaff | null> {
  const session = await getAdminSessionFromCookies();
  if (!session) return null;
  return resolveStaffSession(session);
}

export async function resolveStaffSession(
  session: AdminSessionPayload,
): Promise<VerifiedStaff | null> {
  const [profile] = await db
    .select({ role: profiles.role, email: profiles.email, isActive: profiles.isActive })
    .from(profiles)
    .where(eq(profiles.id, session.sub));

  if (!profile?.isActive) return null;
  if (profile.role !== "admin" && profile.role !== "operator") return null;
  if (session.role !== profile.role) return null;

  return {
    userId: session.sub,
    email: profile.email,
    role: profile.role as StaffRole,
  };
}
