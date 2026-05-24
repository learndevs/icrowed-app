#!/usr/bin/env bash
# Install nginx, configure reverse proxy for icrowd.lk, and restart the Next.js app.
# Run as root on the AlmaLinux VPS:
#   curl -fsSL ... | bash
# Or from a cloned repo:
#   DOMAIN=icrowd.lk APP_URL=http://icrowd.lk bash scripts/setup-nginx-reverse-proxy.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/icrowed-app}"
APP_USER="${APP_USER:-icrowd}"
PORT="${PORT:-3000}"
DOMAIN="${DOMAIN:-icrowd.lk}"
APP_URL="${APP_URL:-http://${DOMAIN}}"

echo "==> Installing nginx and firewalld (if missing)..."
if command -v dnf >/dev/null 2>&1; then
  dnf install -y nginx firewalld
elif command -v apt-get >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y nginx
else
  echo "Unsupported package manager. Install nginx manually."
  exit 1
fi

echo "==> Writing nginx config for ${DOMAIN}..."
mkdir -p /etc/nginx/conf.d

# AlmaLinux ships a default_server block in nginx.conf — only one is allowed on port 80.
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

echo "==> Testing and reloading nginx..."
nginx -t
systemctl enable --now nginx
systemctl reload nginx

if command -v firewall-cmd >/dev/null 2>&1; then
  echo "==> Opening HTTP in firewalld..."
  systemctl enable --now firewalld
  firewall-cmd --permanent --add-service=http
  firewall-cmd --reload
fi

ENV_FILE="${APP_DIR}/apps/web/.env"
if [[ -f "${ENV_FILE}" ]]; then
  if grep -q '^NEXT_PUBLIC_APP_URL=' "${ENV_FILE}"; then
    sed -i "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=${APP_URL}|" "${ENV_FILE}"
  else
    echo "NEXT_PUBLIC_APP_URL=${APP_URL}" >> "${ENV_FILE}"
  fi
fi

if [[ -d "${APP_DIR}/.git" ]]; then
  echo "==> Installing workspace dependencies..."
  cd "${APP_DIR}"
  npm ci

  echo "==> Rebuilding app..."
  npm run build --workspace=web
fi

echo "==> Restarting app with PM2..."
PM2_NAME="icrowed-web"
if pm2 describe icrowd-web >/dev/null 2>&1; then
  PM2_NAME="icrowd-web"
fi

if pm2 describe "${PM2_NAME}" >/dev/null 2>&1; then
  env PORT="${PORT}" pm2 restart "${PM2_NAME}" --update-env
else
  env PORT="${PORT}" pm2 start npm --name "${PM2_NAME}" -- start --workspace=web
fi
pm2 save

echo ""
echo "============================================"
echo "Nginx reverse proxy is ready."
echo "  Domain:  ${DOMAIN}"
echo "  Proxy:   port 80 -> 127.0.0.1:${PORT}"
echo "  App URL: ${APP_URL}"
echo ""
echo "Make sure DNS A records point to this server IP:"
echo "  @   -> your server IP"
echo "  www -> your server IP"
echo ""
echo "Useful commands:"
echo "  pm2 logs ${PM2_NAME}"
echo "  systemctl status nginx"
echo "  curl -I http://127.0.0.1:${PORT}"
echo "================================================"
