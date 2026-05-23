#!/usr/bin/env bash
# Install nginx, configure reverse proxy for dertt.lk, and restart the Next.js app.
# Run as root on the AlmaLinux VPS:
#   curl -fsSL ... | bash
# Or from a cloned repo:
#   DOMAIN=dertt.lk APP_URL=http://dertt.lk bash scripts/setup-nginx-reverse-proxy.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/icrowd-app}"
APP_USER="${APP_USER:-icrowd}"
PORT="${PORT:-3000}"
DOMAIN="${DOMAIN:-dertt.lk}"
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
  echo "==> Rebuilding app..."
  cd "${APP_DIR}"
  sudo -u "${APP_USER}" npm run netlify:build
fi

echo "==> Restarting app with PM2..."
if sudo -u "${APP_USER}" pm2 describe icrowd-web >/dev/null 2>&1; then
  sudo -u "${APP_USER}" env PORT="${PORT}" pm2 restart icrowd-web --update-env
else
  sudo -u "${APP_USER}" env PORT="${PORT}" pm2 start npm --name icrowd-web -- start --workspace=web
fi
sudo -u "${APP_USER}" pm2 save

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
echo "  sudo -u ${APP_USER} pm2 logs icrowd-web"
echo "  systemctl status nginx"
echo "  curl -I http://127.0.0.1:${PORT}"
echo "============================================"
