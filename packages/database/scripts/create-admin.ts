/**
 * Create (or promote) an admin user directly in Postgres.
 *
 *   npm run admin:create -w @icrowd/database -- --email you@example.com [--password 'pw'] [--name 'Full Name'] [--role admin|operator]
 *
 * Uses DATABASE_URL from apps/web/.env.local. Passwords are hashed with Better Auth's
 * own scrypt hasher, so the account can sign in at /admin/login immediately.
 * Re-running for an existing email resets the password and sets the role.
 */
import * as dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import { Client } from "pg";
import { hashPassword } from "better-auth/crypto";

dotenv.config({ path: path.resolve(__dirname, "../../../apps/web/.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const DATABASE_URL = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in apps/web/.env.local");
  process.exit(1);
}

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const rawEmail = arg("--email");
if (!rawEmail) {
  console.error("❌ Missing --email <address>");
  process.exit(1);
}
const email = rawEmail.trim().toLowerCase();
const fullName = arg("--name") ?? null;
const role = arg("--role") ?? "admin";
if (role !== "admin" && role !== "operator") {
  console.error("❌ --role must be admin or operator");
  process.exit(1);
}

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
  if (password.length < 8) throw new Error("Password must be at least 8 characters");

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: /localhost|127\.0\.0\.1|sslmode=disable/i.test(DATABASE_URL!)
      ? false
      : { rejectUnauthorized: false },
  });
  await client.connect();
  console.log(`👤 Creating/promoting ${role}: ${email}\n`);

  try {
    await client.query("BEGIN");

    const found = await client.query<{ id: string }>(
      "SELECT id FROM profiles WHERE lower(email) = $1 LIMIT 1",
      [email],
    );

    let userId: string;
    if (found.rows[0]) {
      userId = found.rows[0].id;
      console.log("  → profile exists, updating role");
      await client.query(
        `UPDATE profiles
            SET role = $2, is_active = true, email_verified = true,
                full_name = COALESCE($3, full_name), updated_at = now()
          WHERE id = $1`,
        [userId, role, fullName],
      );
    } else {
      console.log("  → creating profile");
      const created = await client.query<{ id: string }>(
        `INSERT INTO profiles (email, full_name, role, is_active, email_verified)
         VALUES ($1, $2, $3, true, true) RETURNING id`,
        [email, fullName, role],
      );
      userId = created.rows[0].id;
    }

    const hash = await hashPassword(password);
    const cred = await client.query(
      "UPDATE auth_accounts SET password = $2, updated_at = now() WHERE user_id = $1 AND provider_id = 'credential'",
      [userId, hash],
    );
    if (cred.rowCount === 0) {
      await client.query(
        "INSERT INTO auth_accounts (user_id, account_id, provider_id, password) VALUES ($1, $2, 'credential', $3)",
        [userId, userId, hash],
      );
    }

    await client.query("COMMIT");

    console.log("\n✅ Ready.\n");
    console.log("  Email:    ", email);
    console.log("  Password: ", password, generated ? "(generated — save this now)" : "");
    console.log("  Role:     ", role);
    console.log("\n  Sign in at /admin/login");
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
