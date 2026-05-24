#!/usr/bin/env bash
# Reinstall monorepo deps, build, and restart PM2 on the VPS.
# Run as the `icrowd` user (or root via sudo) from repo root:
#   bash scripts/rebuild-and-restart.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/icrowed-app}"
PORT="${PORT:-3000}"
PM2_NAME="${PM2_NAME:-icrowed-web}"
ECOSYSTEM="${APP_DIR}/ecosystem.config.cjs"

cd "${APP_DIR}"

echo "==> Ensuring log dir exists..."
sudo mkdir -p /var/log/icrowed
sudo chown -R "$(id -un):$(id -gn)" /var/log/icrowed || true

echo "==> Installing all workspace packages (required for @icrowd/* imports)..."
npm ci

echo "==> Verifying monorepo links..."
for pkg in database env types; do
  if [[ ! -e "node_modules/@icrowd/${pkg}" ]]; then
    echo "ERROR: node_modules/@icrowd/${pkg} is missing. Run npm ci from ${APP_DIR}."
    exit 1
  fi
done

echo "==> Building Next.js app..."
npm run netlify:build

# Delete any old PM2 process started via `npm start` (script name "npm") so the
# new node-based process can claim the port cleanly.
for legacy in icrowd-web icrowed-web npm; do
  if pm2 describe "${legacy}" >/dev/null 2>&1; then
    pm2 delete "${legacy}" >/dev/null 2>&1 || true
  fi
done

echo "==> Starting PM2 from ${ECOSYSTEM}..."
env PORT="${PORT}" pm2 startOrReload "${ECOSYSTEM}" --update-env
pm2 save

echo ""
echo "==> Health check..."
sleep 3
curl -fsS "http://127.0.0.1:${PORT}/api/health" || {
  echo "WARN: /api/health did not respond. Check 'pm2 logs ${PM2_NAME}'."
}

echo ""
echo "Done. Check:"
echo "  pm2 status"
echo "  pm2 logs ${PM2_NAME}"
echo "  curl -I http://127.0.0.1:${PORT}"
