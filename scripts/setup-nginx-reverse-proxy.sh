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

# Shared gzip + proxy cache config — drop in /etc/nginx/conf.d so it applies once.
cat > /etc/nginx/conf.d/00-icrowd-shared.conf <<'NGINX_SHARED'
# Gzip
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_min_length 1024;
gzip_types
  text/plain
  text/css
  text/xml
  text/javascript
  application/javascript
  application/x-javascript
  application/json
  application/xml
  application/xml+rss
  application/rss+xml
  application/atom+xml
  application/wasm
  image/svg+xml
  font/woff
  font/woff2;

# Proxy cache for hot SSR pages (used selectively below).
proxy_cache_path /var/cache/nginx/icrowd levels=1:2 keys_zone=icrowd_cache:50m max_size=1g inactive=60m use_temp_path=off;

# Strong default proxy headers.
proxy_http_version 1.1;
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host  $host;
proxy_read_timeout 60s;
proxy_send_timeout 60s;
NGINX_SHARED

mkdir -p /var/cache/nginx/icrowd
chown -R nginx:nginx /var/cache/nginx/icrowd 2>/dev/null || true

cat > /etc/nginx/conf.d/icrowd.conf <<NGINX
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name ${DOMAIN} www.${DOMAIN} _;

    # Stronger client buffers — Next.js can stream large RSC responses.
    client_max_body_size 25m;

    # Hashed Next.js assets are content-addressed; cache them forever.
    location /_next/static/ {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_cache icrowd_cache;
        proxy_cache_valid 200 365d;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        access_log off;
    }

    # Next/Image output (auto-optimised images).
    location /_next/image {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_cache icrowd_cache;
        proxy_cache_valid 200 7d;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        add_header Cache-Control "public, max-age=604800" always;
        access_log off;
    }

    # Public static files from /public.
    location ~* ^/(.*\\.(?:ico|svg|png|jpg|jpeg|gif|webp|avif|woff|woff2|ttf|otf|css|js|map))$ {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_cache icrowd_cache;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000" always;
        access_log off;
    }

    # Health probe — never cache, never log.
    location = /api/health {
        proxy_pass http://127.0.0.1:${PORT};
        access_log off;
    }

    # Everything else.
    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
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
  npm run netlify:build
fi

echo "==> Restarting app with PM2 via ${APP_DIR}/ecosystem.config.cjs..."
PM2_NAME="icrowed-web"

# Wipe any legacy `pm2 start npm` entries so the node-based process can bind.
for legacy in icrowd-web icrowed-web npm; do
  pm2 delete "${legacy}" >/dev/null 2>&1 || true
done

if [[ -f "${APP_DIR}/ecosystem.config.cjs" ]]; then
  env PORT="${PORT}" pm2 startOrReload "${APP_DIR}/ecosystem.config.cjs" --update-env
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
