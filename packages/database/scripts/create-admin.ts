/**
 * Create (or promote) an admin user.
 *
 *   npm run admin:create -w @icrowed/database -- --email you@example.com [--password 'pw'] [--name 'Full Name']
 *
 * Loads SUPABASE creds from icrowed-app/.env.local (same as seed.ts).
 * Uses the Supabase Auth Admin REST API + PostgREST so no extra deps are needed.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY to be the real service_role JWT
 * (NOT the anon key — anon cannot create auth users).
 */
import * as dotenv from "dotenv";
import path from "path";
import crypto from "crypto";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function decodeJwtRole(jwt: string): string | null {
  try {
    const payload = jwt.split(".")[1];
    const json = Buffer.from(payload, "base64").toString("utf8");
    return JSON.parse(json).role ?? null;
  } catch {
    return null;
  }
}

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

const role = decodeJwtRole(SERVICE_KEY);
if (role !== "service_role") {
  console.error(
    `❌ SUPABASE_SERVICE_ROLE_KEY decodes as role="${role}". You need the real service_role key from Supabase dashboard → Project Settings → API.`
  );
  process.exit(1);
}

// ─── CLI args ────────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
const authHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function findAuthUserByEmail(email: string): Promise<{ id: string } | null> {
  // GET /auth/v1/admin/users?filter=email=eq.<email> returns paged list; we filter client-side too.
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=200`, {
    headers: authHeaders,
  });
  if (!res.ok) {
    throw new Error(`list users: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { users?: Array<{ id: string; email?: string }> };
  const user = body.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return user ? { id: user.id } : null;
}

async function createAuthUser(email: string, password: string): Promise<{ id: string }> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!res.ok) {
    throw new Error(`create user: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { id: string };
  return { id: body.id };
}

async function updateAuthPassword(id: string, password: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ password, email_confirm: true }),
  });
  if (!res.ok) {
    throw new Error(`update password: ${res.status} ${await res.text()}`);
  }
}

async function upsertProfile(id: string, email: string, fullName: string | null): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?on_conflict=id`, {
    method: "POST",
    headers: {
      ...authHeaders,
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify([
      {
        id,
        email,
        full_name: fullName,
        role: "admin",
        is_active: true,
      },
    ]),
  });
  if (!res.ok) {
    throw new Error(`upsert profile: ${res.status} ${await res.text()}`);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`👤 Creating admin user: ${email}\n`);

  let userId: string;
  const existing = await findAuthUserByEmail(email);

  if (existing) {
    console.log("  → auth user exists, resetting password");
    await updateAuthPassword(existing.id, password);
    userId = existing.id;
  } else {
    console.log("  → creating new auth user");
    const created = await createAuthUser(email, password);
    userId = created.id;
  }

  console.log("  → upserting profile with role=admin");
  await upsertProfile(userId, email, fullName);

  console.log("\n✅ Admin ready.\n");
  console.log("  Email:    ", email);
  console.log("  Password: ", password, generated ? "(generated — save this now)" : "");
  console.log("  User ID:  ", userId);
  console.log("\n  Sign in at /login then visit /admin");
}

main().catch((err) => {
  console.error("\n❌ Failed:", err.message ?? err);
  process.exit(1);
});
