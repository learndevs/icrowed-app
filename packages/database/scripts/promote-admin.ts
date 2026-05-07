/**
 * Create (or promote) an admin user via direct Postgres connection.
 *
 *   npm run admin:promote -w @icrowed/database -- --email you@example.com [--password 'pw'] [--name 'Full Name']
 *
 * Uses DATABASE_URL from icrowed-app/.env.local. Works without the Supabase
 * service_role key. If the email already has an auth.users row, this only
 * upserts the profile with role='admin'. Otherwise it inserts a new auth.users
 * row (bcrypt password via pgcrypto's crypt()) plus the profile.
 */
import * as dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import { Client } from "pg";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in .env.local");
  process.exit(1);
}

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const email = arg("--email");
if (!email) {
  console.error("❌ Missing --email <address>");
  process.exit(1);
}
const fullName = arg("--name") ?? null;

function generatePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%^&*";
  const all = upper + lower + digits + symbols;
  const pick = (set: string) => set[crypto.randomInt(0, set.length)];
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  for (let i = 0; i < 16; i++) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

const password = arg("--password") ?? generatePassword();
const generated = !arg("--password");

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log(`👤 Promoting/creating admin: ${email}\n`);

  try {
    await client.query("BEGIN");

    // Look up existing auth user by email
    const existing = await client.query<{ id: string }>(
      "SELECT id FROM auth.users WHERE lower(email) = lower($1) LIMIT 1",
      [email]
    );

    let userId: string;

    if (existing.rowCount && existing.rows[0]) {
      userId = existing.rows[0].id;
      console.log("  → auth user exists, resetting password");
      await client.query(
        `UPDATE auth.users
         SET encrypted_password = crypt($1, gen_salt('bf')),
             email_confirmed_at = COALESCE(email_confirmed_at, now()),
             updated_at = now()
         WHERE id = $2`,
        [password, userId]
      );
    } else {
      console.log("  → creating new auth user");
      const insert = await client.query<{ id: string }>(
        `INSERT INTO auth.users (
           instance_id, id, aud, role, email, encrypted_password,
           email_confirmed_at, created_at, updated_at,
           raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user,
           confirmation_token, recovery_token, email_change_token_new,
           email_change_token_current, email_change, phone_change,
           phone_change_token, reauthentication_token
         ) VALUES (
           '00000000-0000-0000-0000-000000000000',
           gen_random_uuid(),
           'authenticated',
           'authenticated',
           $1,
           crypt($2, gen_salt('bf')),
           now(),
           now(),
           now(),
           '{"provider":"email","providers":["email"]}'::jsonb,
           '{}'::jsonb,
           false, false,
           '', '', '', '', '', '', '', ''
         )
         RETURNING id`,
        [email, password]
      );
      userId = insert.rows[0].id;

      // GoTrue requires a matching identities row for email/password login
      await client.query(
        `INSERT INTO auth.identities (
           id, user_id, identity_data, provider, provider_id,
           last_sign_in_at, created_at, updated_at
         ) VALUES (
           gen_random_uuid(),
           $1::uuid,
           jsonb_build_object('sub', $1::text, 'email', $2::text, 'email_verified', true, 'phone_verified', false),
           'email',
           $1::text,
           now(), now(), now()
         )`,
        [userId, email]
      );
    }

    // Upsert profile with role=admin
    console.log("  → upserting profile with role=admin");
    await client.query(
      `INSERT INTO profiles (id, email, full_name, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, 'admin', true, now(), now())
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
         role = 'admin',
         is_active = true,
         updated_at = now()`,
      [userId, email, fullName]
    );

    await client.query("COMMIT");

    console.log("\n✅ Admin ready.\n");
    console.log("  Email:    ", email);
    console.log("  Password: ", password, generated ? "(generated — save this now)" : "");
    console.log("  User ID:  ", userId);
    console.log("\n  Sign in at /login then visit /admin");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("\n❌ Failed:", err.message ?? err);
  process.exit(1);
});
