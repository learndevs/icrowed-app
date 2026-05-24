#!/usr/bin/env bash
# AlmaLinux / RHEL VPS setup for iCrowd Next.js app
# Run as root on the server: bash deploy-almalinux.sh

set -euo pipefail

APP_DIR="/var/www/icrowed-app"
APP_USER="icrowd"
NODE_MAJOR=20
REPO_URL="https://github.com/learndevs/icrowd-app.git"
BRANCH="${BRANCH:-merge}"
PORT="${PORT:-3000}"
DOMAIN="${DOMAIN:-icrowd.lk}"
APP_URL="${APP_URL:-http://${DOMAIN}}"

echo "==> Installing system packages..."
dnf install -y git curl nginx firewalld

# Small VPSes ship with zero swap, so `npm ci` + `next build` OOMs (ENOMEM).
# Provision a swap file early — idempotent on re-runs.
echo "==> Ensuring swap is enabled (prevents ENOMEM during build)..."
if [[ "$(awk '/SwapTotal/ {print $2}' /proc/meminfo)" -eq 0 ]]; then
  SWAP_FILE=/swapfile
  if [[ ! -f "${SWAP_FILE}" ]]; then
    if ! fallocate -l 2G "${SWAP_FILE}" 2>/dev/null; then
      dd if=/dev/zero of="${SWAP_FILE}" bs=1M count=2048 status=progress
    fi
  fi
  chmod 600 "${SWAP_FILE}"
  mkswap "${SWAP_FILE}"
  swapon "${SWAP_FILE}"
  if ! grep -q "^${SWAP_FILE} " /etc/fstab; then
    echo "${SWAP_FILE} none swap sw 0 0" >> /etc/fstab
  fi
  sysctl -w vm.swappiness=10 >/dev/null || true
  echo "vm.swappiness=10" >> /etc/sysctl.conf
fi
free -h || true

echo "==> Installing Node.js ${NODE_MAJOR}..."
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt "${NODE_MAJOR}" ]]; then
  curl -fsSL "https://rpm.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  dnf install -y nodejs
fi
echo "Node: $(node -v) | npm: $(npm -v)"

echo "==> Installing PM2..."
npm install -g pm2

echo "==> Creating app user and directory..."
id "${APP_USER}" &>/dev/null || useradd -r -m -d "${APP_DIR}" -s /sbin/nologin "${APP_USER}"
mkdir -p "${APP_DIR}"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

echo "==> Cloning or updating repository..."
if [[ -d "${APP_DIR}/.git" ]]; then
  sudo -u "${APP_USER}" git -C "${APP_DIR}" fetch origin
  sudo -u "${APP_USER}" git -C "${APP_DIR}" checkout "${BRANCH}"
  sudo -u "${APP_USER}" git -C "${APP_DIR}" pull origin "${BRANCH}"
else
  sudo -u "${APP_USER}" git clone --branch "${BRANCH}" "${REPO_URL}" "${APP_DIR}"
fi

ENV_FILE="${APP_DIR}/apps/web/.env"
if [[ ! -f "${ENV_FILE}" ]]; then
  echo "==> Creating ${ENV_FILE} from example — edit secrets before continuing if needed."
  cp "${APP_DIR}/apps/web/.env.example" "${ENV_FILE}"
  chown "${APP_USER}:${APP_USER}" "${ENV_FILE}"
fi

# Ensure production URL is set
if grep -q '^NEXT_PUBLIC_APP_URL=' "${ENV_FILE}"; then
  sed -i "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=${APP_URL}|" "${ENV_FILE}"
else
  echo "NEXT_PUBLIC_APP_URL=${APP_URL}" >> "${ENV_FILE}"
fi

# Required by @icrowd/env at runtime — add placeholders if missing
grep -q '^RESEND_API_KEY=' "${ENV_FILE}" || echo 'RESEND_API_KEY=re_placeholder_replace_me' >> "${ENV_FILE}"
grep -q '^EMAIL_FROM=' "${ENV_FILE}" || echo 'EMAIL_FROM=orders@icrowd.com' >> "${ENV_FILE}"
grep -q '^STRIPE_SECRET_KEY=' "${ENV_FILE}" || echo 'STRIPE_SECRET_KEY=sk_test_placeholder' >> "${ENV_FILE}"
grep -q '^STRIPE_WEBHOOK_SECRET=' "${ENV_FILE}" || echo 'STRIPE_WEBHOOK_SECRET=whsec_placeholder' >> "${ENV_FILE}"

echo "==> Installing dependencies and building (this may take several minutes)..."
cd "${APP_DIR}"

# Drop any stale .next/lock from a previously OOM-killed `next build`.
LOCKFILE="${APP_DIR}/apps/web/.next/lock"
if [[ -e "${LOCKFILE}" ]] && ! pgrep -f 'next/dist/bin/next build' >/dev/null 2>&1; then
  echo "==> Removing stale ${LOCKFILE}..."
  rm -f "${LOCKFILE}"
fi

# Keep memory footprint low on 1–2 GB boxes.
BUILD_ENV='NODE_OPTIONS=--max-old-space-size=1024 NPM_CONFIG_FUND=false NPM_CONFIG_AUDIT=false NPM_CONFIG_PROGRESS=false'
sudo -u "${APP_USER}" env ${BUILD_ENV} npm ci --no-audit --no-fund --prefer-offline --maxsockets=4
sudo -u "${APP_USER}" env ${BUILD_ENV} npm run build:web

echo "==> Preparing PM2 log directory..."
mkdir -p /var/log/icrowed
chown -R "${APP_USER}:${APP_USER}" /var/log/icrowed

echo "==> Starting app with PM2 (ecosystem.config.cjs runs node directly)..."
# Clean up any legacy `pm2 start npm` process from older deploys — those can
# leave a zombie node holding port ${PORT} and break the new start.
for legacy in icrowd-web icrowed-web npm; do
  sudo -u "${APP_USER}" pm2 delete "${legacy}" >/dev/null 2>&1 || true
done
sudo -u "${APP_USER}" env PORT="${PORT}" pm2 startOrReload "${APP_DIR}/ecosystem.config.cjs" --update-env
sudo -u "${APP_USER}" pm2 save

echo "==> Enabling PM2 on boot..."
env PATH="$PATH" pm2 startup systemd -u "${APP_USER}" --hp "${APP_DIR}" | tail -1 | bash || true

echo "==> Configuring nginx reverse proxy..."
mkdir -p /etc/nginx/conf.d

if [[ -f /etc/nginx/nginx.conf ]]; then
  sed -i 's/listen       80 default_server;/listen       80;/' /etc/nginx/nginx.conf
  sed -i 's/listen       \[::\]:80 default_server;/listen       [::]:80;/' /etc/nginx/nginx.conf
fi

cat > /etc/nginx/conf.d/icrowd.conf <<NGINX
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name ${DOMAIN} www.${DOMAIN} _;

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

nginx -t
systemctl enable --now nginx
systemctl reload nginx

echo "==> Opening firewall (HTTP)..."
systemctl enable --now firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --reload

echo ""
echo "============================================"
echo "Deploy complete."
echo "  App URL: ${APP_URL}"
echo "  PM2:     pm2 status -u ${APP_USER}"
echo "  Logs:    sudo -u ${APP_USER} pm2 logs icrowd-web"
echo "  Env:     ${ENV_FILE}"
echo ""
echo "Edit ${ENV_FILE} with real Stripe/Resend keys, then:"
echo "  cd ${APP_DIR} && sudo -u ${APP_USER} bash scripts/rebuild-and-restart.sh"
echo "============================================"
