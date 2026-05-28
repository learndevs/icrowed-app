#!/usr/bin/env bash
# Run on VPS as root: bash scripts/vps-diagnose.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/icrowed-app}"
PM2_NAME="${PM2_NAME:-icrowed-web}"
PORT="${PORT:-3000}"

echo "=== iCrowd VPS diagnostics ==="
echo "Time: $(date -u)"
echo "Hostname: $(hostname)"
echo "User: $(whoami)"
echo

echo "=== Load / memory ==="
uptime
free -h
echo

echo "=== PM2 status ==="
pm2 status
echo

echo "=== PM2 restarts (high restarts = cold DB pools) ==="
pm2 jlist 2>/dev/null | node -e "
let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
  try {
    const apps = JSON.parse(d);
    for (const a of apps) {
      const uptime = a.pm2_env.pm_uptime
        ? Math.round((Date.now()-a.pm2_env.pm_uptime)/1000)+'s'
        : 'n/a';
      console.log(a.name + ': status=' + a.pm2_env.status + ' restarts=' + a.pm2_env.restart_time + ' uptime=' + uptime);
    }
  } catch(e) { console.log('Could not parse pm2 jlist'); }
});
" 2>/dev/null || true
echo

echo "=== Recent app errors (last 50 lines) ==="
pm2 logs "${PM2_NAME}" --lines 50 --nostream 2>/dev/null \
  || pm2 logs icrowd-web --lines 50 --nostream 2>/dev/null \
  || echo "No PM2 logs found"
echo

echo "=== Nginx ==="
systemctl is-active nginx 2>/dev/null || true
echo

echo "=== Network latency to Supabase pooler (Singapore) ==="
POOLER="${SUPABASE_POOLER:-aws-1-ap-southeast-1.pooler.supabase.com}"
ping -c 5 "${POOLER}" 2>/dev/null | tail -2 || echo "ping blocked"
echo

echo "=== Local API timing (localhost:${PORT}) ==="
for path in /api/delivery-types /api/new-arrivals; do
  if command -v curl >/dev/null 2>&1; then
    echo -n "GET ${path}: "
    curl -s -o /dev/null -w "HTTP %{http_code} | connect %{time_connect}s | TTFB %{time_starttransfer}s | total %{time_total}s\n" \
      "http://127.0.0.1:${PORT}${path}" --max-time 30 || echo "failed"
  fi
done
echo

echo "=== DB connection test (uses apps/web/.env) ==="
ENV_FILE="${APP_DIR}/apps/web/.env"
if [[ ! -f "${ENV_FILE}" ]]; then
  ENV_FILE="${APP_DIR}/apps/web/.env.local"
fi
if [[ -f "${ENV_FILE}" ]] && command -v node >/dev/null 2>&1; then
  node - "${ENV_FILE}" <<'NODE'
const fs = require("fs");
const pg = require("pg");
const envPath = process.argv[1];
const env = fs.readFileSync(envPath, "utf8");
const m = env.match(/^DATABASE_URL=(.+)$/m);
if (!m) { console.log("DATABASE_URL not found in env"); process.exit(0); }
const cs = m[1].trim().replace(/^["']|["']$/g, "");
(async () => {
  const pool = new pg.Pool({ connectionString: cs, ssl: { rejectUnauthorized: false }, max: 1, connectionTimeoutMillis: 20000 });
  for (const label of ["connect", "warm query"]) {
    const t0 = performance.now();
    const c = await pool.connect();
    await c.query(label === "connect" ? "SELECT 1" : "SELECT COUNT(*) FROM delivery_types");
    c.release();
    console.log("  " + label + ": " + Math.round(performance.now() - t0) + "ms");
  }
  await pool.end();
})().catch((e) => console.log("DB test failed:", e.message));
NODE
else
  echo "Skip DB test (env or node missing at ${APP_DIR})"
fi

echo
echo "=== Done ==="
