#!/usr/bin/env bash
# Reinstall monorepo deps, build, and restart PM2 on the VPS — low‑RAM safe.
# Run as the `icrowd` user (or root via sudo) from repo root:
#   bash scripts/rebuild-and-restart.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/icrowed-app}"
PORT="${PORT:-3000}"
PM2_NAME="${PM2_NAME:-icrowed-web}"
ECOSYSTEM="${APP_DIR}/ecosystem.config.cjs"

# Memory caps — chosen for a 1–2 GB VPS with 2 GB swap. Bump if you have more RAM.
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1024}"
export NPM_CONFIG_FUND=false
export NPM_CONFIG_AUDIT=false
export NPM_CONFIG_PROGRESS=false

cd "${APP_DIR}"

echo "==> Memory before build:"
free -h || true

echo "==> Ensuring log dir exists..."
sudo mkdir -p /var/log/icrowed
sudo chown -R "$(id -un):$(id -gn)" /var/log/icrowed || true

# Stop the running app FIRST. The Next.js server commonly holds 300–600 MB
# resident; freeing that RAM is what lets npm ci + next build fit on a 1 GB box.
echo "==> Stopping running PM2 process(es) to free RAM during build..."
for legacy in icrowed-web icrowd-web npm; do
  if pm2 describe "${legacy}" >/dev/null 2>&1; then
    pm2 stop "${legacy}" >/dev/null 2>&1 || true
  fi
done

# Also drop the OS page cache so swap pressure during the build is realistic.
sync || true
sudo sh -c 'echo 1 > /proc/sys/vm/drop_caches' 2>/dev/null || true

# Next.js 16 acquires .next/lock on `next build` and releases it on clean
# exit. An OOM kill skips cleanup, leaving a stale lock that blocks every
# future build with "Another next build process is already running."
# We just stopped PM2 and aren't running a concurrent build, so any lock
# here is by definition stale — but double-check no `next build` is alive.
LOCKFILE="${APP_DIR}/apps/web/.next/lock"
if [[ -e "${LOCKFILE}" ]]; then
  if pgrep -f 'next/dist/bin/next build' >/dev/null 2>&1; then
    echo "ERROR: .next/lock exists AND a 'next build' process is running."
    echo "       Wait for it, or pkill -f 'next/dist/bin/next build' then retry."
    exit 1
  fi
  echo "==> Removing stale ${LOCKFILE} (leftover from a previous OOM-killed build)..."
  rm -f "${LOCKFILE}"
fi

echo "==> Installing all workspace packages (required for @icrowd/* imports)..."
npm ci --no-audit --no-fund --prefer-offline --maxsockets=4

echo "==> Verifying monorepo links..."
for pkg in database env types; do
  if [[ ! -e "node_modules/@icrowd/${pkg}" ]]; then
    echo "ERROR: node_modules/@icrowd/${pkg} is missing. Run npm ci from ${APP_DIR}."
    exit 1
  fi
done

# Early DB connectivity probe — tells you BEFORE the long build that
# Supabase is unreachable from this host (DNS, firewall, wrong URL).
# Failure is non-fatal: the build now degrades gracefully, but you'll
# want to know about it.
if [[ -f "${APP_DIR}/apps/web/.env" ]] || [[ -f "${APP_DIR}/apps/web/.env.local" ]]; then
  echo "==> Probing Supabase connectivity..."
  set +e
  node -e '
    require("dotenv").config({ path: "apps/web/.env.local" });
    require("dotenv").config({ path: "apps/web/.env" });
    const url = process.env.DATABASE_URL;
    if (!url) { console.log("(no DATABASE_URL set)"); process.exit(0); }
    const { Client } = require("pg");
    const c = new Client({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    c.connect()
      .then(() => c.query("select 1"))
      .then(() => { console.log("    OK"); c.end(); })
      .catch((e) => {
        console.log("    FAIL:", e.message);
        console.log("    The build will continue with safe fallbacks, but the");
        console.log("    running app will not be able to serve data until this is fixed.");
      });
  ' 2>/dev/null || echo "    (skipped — node/dotenv not installed yet)"
  set -e
fi

echo "==> Clearing stale Next.js ISR cache + nginx proxy cache..."
rm -rf apps/web/.next/cache
sudo rm -rf /var/cache/nginx/icrowd/* 2>/dev/null || true

echo "==> Building Next.js app (NODE_OPTIONS=${NODE_OPTIONS})..."
npm run build:web

# Delete any old PM2 process started via `npm start` so the new node-based
# process can claim the port cleanly.
for legacy in icrowd-web icrowed-web npm; do
  if pm2 describe "${legacy}" >/dev/null 2>&1; then
    pm2 delete "${legacy}" >/dev/null 2>&1 || true
  fi
done

echo "==> Starting PM2 from ${ECOSYSTEM}..."
env PORT="${PORT}" pm2 startOrReload "${ECOSYSTEM}" --update-env
pm2 save

echo ""
echo "==> Memory after start:"
free -h || true

echo ""
echo "==> Health check..."
sleep 5
curl -fsS "http://127.0.0.1:${PORT}/api/health" || {
  echo "WARN: /api/health did not respond. Check 'pm2 logs ${PM2_NAME}'."
}

echo ""
echo "Done. Check:"
echo "  pm2 status"
echo "  pm2 logs ${PM2_NAME}"
echo "  curl -I http://127.0.0.1:${PORT}"
