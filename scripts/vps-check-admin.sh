#!/usr/bin/env bash
# Run on VPS as root (you are SSH'd in):
#   cd /var/www/icrowed-app && bash scripts/vps-check-admin.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/icrowed-app}"
cd "${APP_DIR}"

echo "=== iCrowd admin DB + deploy check ==="
echo "Time: $(date -u)"
echo "App dir: ${APP_DIR}"
echo

echo "=== 1) Admin login code deployed? ==="
for f in \
  apps/web/src/lib/admin-session.ts \
  apps/web/src/lib/admin-auth.ts \
  apps/web/src/app/admin/login/page.tsx \
  apps/web/src/app/api/admin/auth/login/route.ts; do
  if [[ -f "${f}" ]]; then
    echo "  OK  ${f}"
  else
    echo "  MISSING  ${f}"
  fi
done
if sudo -u icrowd git -C "${APP_DIR}" rev-parse --short HEAD &>/dev/null; then
  echo "  Git: $(sudo -u icrowd git -C "${APP_DIR}" branch --show-current) @ $(sudo -u icrowd git -C "${APP_DIR}" rev-parse --short HEAD)"
fi
echo

ENV_FILE="${APP_DIR}/apps/web/.env"
[[ -f "${ENV_FILE}" ]] || ENV_FILE="${APP_DIR}/apps/web/.env.local"
if [[ ! -f "${ENV_FILE}" ]]; then
  echo "ERROR: No apps/web/.env or .env.local"
  exit 1
fi

echo "=== 2) DATABASE_URL target (masked) ==="
grep -E '^DATABASE_URL=' "${ENV_FILE}" | sed 's/:[^:@/]*@/:***@/' || echo "DATABASE_URL not set"
echo

echo "=== 3) Postgres admin prerequisites ==="
if ! command -v node >/dev/null 2>&1; then
  echo "node not found — install Node or run checks manually with psql"
  exit 1
fi

sudo -u icrowd node - "${ENV_FILE}" <<'NODE'
const fs = require("fs");
const pg = require("pg");

const envPath = process.argv[1];
const env = fs.readFileSync(envPath, "utf8");
const m = env.match(/^DATABASE_URL=(.+)$/m);
if (!m) {
  console.log("DATABASE_URL missing");
  process.exit(1);
}
const cs = m[1].trim().replace(/^["']|["']$/g, "");
const local =
  /localhost|127\.0\.0\.1/i.test(cs) && !/supabase\.com/i.test(cs);

const pool = new pg.Pool({
  connectionString: cs,
  ssl: local ? false : { rejectUnauthorized: false },
  max: 1,
  connectionTimeoutMillis: 20000,
});

function ok(label, pass, detail = "") {
  console.log((pass ? "  OK   " : "  FAIL ") + label + (detail ? " — " + detail : ""));
}

(async () => {
  const c = await pool.connect();
  try {
    const ext = await c.query(
      "SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'",
    );
    ok("pgcrypto extension", ext.rowCount > 0, ext.rowCount ? "" : "run: CREATE EXTENSION pgcrypto;");

    const authUsers = await c.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'auth' AND table_name = 'users'
      ) AS ok`);
    ok("auth.users table", authUsers.rows[0].ok);

    const authId = await c.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'auth' AND table_name = 'identities'
      ) AS ok`);
    ok("auth.identities table", authId.rows[0].ok);

    const profiles = await c.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'profiles'
      ) AS ok`);
    ok("public.profiles table", profiles.rows[0].ok);

    if (authUsers.rows[0].ok && profiles.rows[0].ok) {
      const admins = await c.query(`
        SELECT p.email, p.role, p.is_active,
               (u.email_confirmed_at IS NOT NULL) AS email_confirmed
        FROM profiles p
        LEFT JOIN auth.users u ON u.id = p.id
        WHERE p.role IN ('admin', 'operator')
        ORDER BY p.email`);
      console.log("\n  Staff profiles:");
      if (!admins.rowCount) {
        console.log("    (none — run admin:promote)");
      } else {
        for (const row of admins.rows) {
          console.log(
            `    - ${row.email} role=${row.role} active=${row.is_active} confirmed=${row.email_confirmed}`,
          );
        }
      }

      const adminLocal = await c.query(`
        SELECT u.id FROM auth.users u
        INNER JOIN profiles p ON p.id = u.id
        WHERE lower(u.email) = lower('admin@icrowed.local')
          AND p.role = 'admin'
        LIMIT 1`);
      ok("admin@icrowed.local", adminLocal.rowCount > 0);
    }
  } finally {
    c.release();
    await pool.end();
  }
})().catch((e) => {
  console.log("  FAIL DB connection/query:", e.message);
  process.exit(1);
});
NODE

echo
echo "=== 4) App route (localhost) ==="
if command -v curl >/dev/null 2>&1; then
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/admin/login --max-time 10 || echo "000")
  echo "  GET /admin/login → HTTP ${code} (200 = new admin UI deployed)"
  code2=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://127.0.0.1:3000/api/admin/auth/login \
    -H "Content-Type: application/json" -d '{}' --max-time 10 || echo "000")
  echo "  POST /api/admin/auth/login → HTTP ${code2} (400 = route exists; 404 = not deployed)"
fi

echo
echo "=== Done ==="
echo "Create/fix admin: npm run admin:promote -w @icrowd/database -- --email admin@icrowed.local --password 'YourPassword' --name Admin"
echo "Sign in: https://YOUR_DOMAIN/admin/login"
