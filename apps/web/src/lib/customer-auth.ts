import "server-only";

import { sql } from "drizzle-orm";
import { db, profiles } from "@icrowd/database";
import { eq } from "drizzle-orm";
import {
  getCustomerSessionFromCookies,
  type CustomerSessionPayload,
} from "@/lib/customer-session";

export type VerifiedCustomer = {
  userId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
};

export type CustomerAuthResult =
  | { status: "ok"; userId: string; email: string }
  | { status: "unverified"; userId: string; email: string };

export async function authenticateCustomer(
  email: string,
  password: string,
): Promise<CustomerAuthResult | null> {
  try {
    const result = await db.execute(sql`
      SELECT
        u.id AS id,
        p.email AS email,
        (u.email_confirmed_at IS NOT NULL) AS confirmed
      FROM auth.users u
      INNER JOIN profiles p ON p.id = u.id
      WHERE lower(u.email) = lower(${email})
        AND u.encrypted_password IS NOT NULL
        AND u.encrypted_password = crypt(${password}, u.encrypted_password)
        AND p.is_active = true
        AND p.role::text = 'customer'
      LIMIT 1
    `);

    const row = result.rows[0] as
      | { id: string; email: string; confirmed: boolean }
      | undefined;
    if (!row) return null;
    if (!row.confirmed) {
      return { status: "unverified", userId: row.id, email: row.email };
    }
    return { status: "ok", userId: row.id, email: row.email };
  } catch (err) {
    console.error("[authenticateCustomer]", err);
    return null;
  }
}

/** @deprecated Use authenticateCustomer */
export async function verifyCustomerCredentials(
  email: string,
  password: string,
): Promise<{ userId: string; email: string } | null> {
  const auth = await authenticateCustomer(email, password);
  if (!auth || auth.status !== "ok") return null;
  return { userId: auth.userId, email: auth.email };
}

export async function confirmCustomerEmail(
  userId: string,
  email: string,
): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      UPDATE auth.users u
      SET email_confirmed_at = now(), updated_at = now()
      FROM profiles p
      WHERE u.id = p.id
        AND u.id = ${userId}::uuid
        AND lower(u.email) = lower(${email})
        AND p.role::text = 'customer'
        AND u.email_confirmed_at IS NULL
      RETURNING u.id
    `);
    if ((result.rowCount ?? 0) === 0) return false;

    await db.execute(sql`
      UPDATE auth.identities
      SET
        identity_data = jsonb_set(
          identity_data,
          '{email_verified}',
          'true'::jsonb,
          true
        ),
        updated_at = now()
      WHERE user_id = ${userId}::uuid
        AND provider = 'email'
    `);
    return true;
  } catch (err) {
    console.error("[confirmCustomerEmail]", err);
    return false;
  }
}

export async function updateCustomerPassword(
  userId: string,
  email: string,
  newPassword: string,
): Promise<boolean> {
  if (newPassword.length < 8) return false;
  try {
    const result = await db.execute(sql`
      UPDATE auth.users u
      SET
        encrypted_password = crypt(${newPassword}, gen_salt('bf')),
        updated_at = now()
      FROM profiles p
      WHERE u.id = p.id
        AND u.id = ${userId}::uuid
        AND lower(u.email) = lower(${email})
        AND p.role::text = 'customer'
        AND p.is_active = true
      RETURNING u.id
    `);
    return (result.rowCount ?? 0) > 0;
  } catch (err) {
    console.error("[updateCustomerPassword]", err);
    return false;
  }
}

export async function getCustomerForEmailActions(email: string): Promise<{
  userId: string;
  email: string;
  fullName: string | null;
  emailConfirmed: boolean;
} | null> {
  try {
    const result = await db.execute(sql`
      SELECT
        u.id AS id,
        p.email AS email,
        p.full_name AS full_name,
        (u.email_confirmed_at IS NOT NULL) AS confirmed
      FROM auth.users u
      INNER JOIN profiles p ON p.id = u.id
      WHERE lower(u.email) = lower(${email})
        AND p.role::text = 'customer'
        AND p.is_active = true
      LIMIT 1
    `);
    const row = result.rows[0] as
      | {
          id: string;
          email: string;
          full_name: string | null;
          confirmed: boolean;
        }
      | undefined;
    if (!row) return null;
    return {
      userId: row.id,
      email: row.email,
      fullName: row.full_name,
      emailConfirmed: row.confirmed,
    };
  } catch (err) {
    console.error("[getCustomerForEmailActions]", err);
    return null;
  }
}

export async function registerCustomer(input: {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}): Promise<
  | {
      userId: string;
      email: string;
      fullName: string | null;
      alreadyPending?: boolean;
    }
  | { error: string; status: number }
> {
  const email = input.email.trim();
  const fullName = input.fullName?.trim() || null;
  const phone = input.phone?.trim() || null;

  if (input.password.length < 8) {
    return { error: "Password must be at least 8 characters.", status: 400 };
  }

  try {
    const existing = await db.execute(sql`
      SELECT p.role::text AS role
      FROM auth.users u
      LEFT JOIN profiles p ON p.id = u.id
      WHERE lower(u.email) = lower(${email})
      LIMIT 1
    `);
    const existingRow = existing.rows[0] as { role: string | null } | undefined;
    if (existingRow) {
      if (existingRow.role === "customer") {
        const pending = await getCustomerForEmailActions(email);
        if (pending && !pending.emailConfirmed) {
          return {
            userId: pending.userId,
            email: pending.email,
            fullName: pending.fullName,
            alreadyPending: true,
          };
        }
        return { error: "An account with this email already exists.", status: 409 };
      }
      if (existingRow.role === "admin" || existingRow.role === "operator") {
        return {
          error: "This email is registered for staff access. Use admin sign in.",
          status: 409,
        };
      }
      // Incomplete sign-up from a prior failed attempt (auth row without profile).
      await db.execute(sql`
        DELETE FROM auth.identities
        WHERE user_id IN (
          SELECT id FROM auth.users WHERE lower(email) = lower(${email})
        )
      `);
      await db.execute(sql`
        DELETE FROM auth.users WHERE lower(email) = lower(${email})
      `);
    }

    const rawUserMetaData = JSON.stringify({
      full_name: fullName,
      phone,
    });

    const userId = await db.transaction(async (tx) => {
      const userResult = await tx.execute(sql`
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password,
          email_confirmed_at, created_at, updated_at,
          raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user,
          confirmation_token, recovery_token, email_change_token_new,
          email_change_token_current, email_change, phone_change,
          phone_change_token, reauthentication_token
        )
        VALUES (
          '00000000-0000-0000-0000-000000000000'::uuid,
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          ${email},
          crypt(${input.password}, gen_salt('bf')),
          NULL,
          now(), now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          ${rawUserMetaData}::jsonb,
          false, false,
          '', '', '', '', '', '', '', ''
        )
        RETURNING id
      `);

      const id = (userResult.rows[0] as { id: string } | undefined)?.id;
      if (!id) throw new Error("auth user insert returned no id");

      const identityData = JSON.stringify({
        sub: id,
        email,
        email_verified: false,
        phone_verified: false,
      });

      await tx.execute(sql`
        INSERT INTO auth.identities (
          id, user_id, identity_data, provider, provider_id,
          last_sign_in_at, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(),
          ${id}::uuid,
          ${identityData}::jsonb,
          'email',
          ${id},
          now(), now(), now()
        )
      `);

      await tx.insert(profiles).values({
        id,
        email,
        fullName,
        phone,
        role: "customer",
        isActive: true,
      });

      return id;
    });

    return { userId, email, fullName };
  } catch (err) {
    console.error("[registerCustomer]", err);
    return { error: "Could not create account.", status: 500 };
  }
}

export async function getCustomerFromSession(): Promise<VerifiedCustomer | null> {
  const session = await getCustomerSessionFromCookies();
  if (!session) return null;
  return resolveCustomerSession(session);
}

export async function resolveCustomerSession(
  session: CustomerSessionPayload,
): Promise<VerifiedCustomer | null> {
  const [profile] = await db
    .select({
      role: profiles.role,
      email: profiles.email,
      isActive: profiles.isActive,
      fullName: profiles.fullName,
      phone: profiles.phone,
    })
    .from(profiles)
    .where(eq(profiles.id, session.sub));

  if (!profile?.isActive) return null;
  if (profile.role !== "customer") return null;

  const confirmed = await db.execute(sql`
    SELECT (email_confirmed_at IS NOT NULL) AS confirmed
    FROM auth.users
    WHERE id = ${session.sub}::uuid
    LIMIT 1
  `);
  const confirmedRow = confirmed.rows[0] as { confirmed: boolean } | undefined;
  if (!confirmedRow?.confirmed) return null;

  return {
    userId: session.sub,
    email: profile.email,
    fullName: profile.fullName,
    phone: profile.phone,
  };
}
