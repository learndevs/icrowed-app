#!/usr/bin/env bash
# Reinstall monorepo deps, build, and restart PM2 on the VPS.
# Run as root from repo root: bash scripts/rebuild-and-restart.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/icrowed-app}"
PORT="${PORT:-3000}"
PM2_NAME="${PM2_NAME:-icrowed-web}"

cd "${APP_DIR}"

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
npm run build --workspace=web

echo "==> Restarting PM2 (${PM2_NAME})..."
if pm2 describe "${PM2_NAME}" >/dev/null 2>&1; then
  env PORT="${PORT}" pm2 restart "${PM2_NAME}" --update-env
elif pm2 describe icrowd-web >/dev/null 2>&1; then
  env PORT="${PORT}" pm2 restart icrowd-web --update-env
else
  env PORT="${PORT}" pm2 start npm --name "${PM2_NAME}" -- start --workspace=web
fi
pm2 save

echo ""
echo "Done. Check:"
echo "  pm2 status"
echo "  curl -I http://127.0.0.1:${PORT}"
