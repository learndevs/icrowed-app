#!/usr/bin/env bash
# Full Supabase self-host via Docker — requires 4GB+ RAM (8GB recommended).
# Your current VPS (~1.7GB) is too small; upgrade first or use vps-postgres-setup.sh instead.
#
# Run as root on a VPS with Docker installed and 4GB+ RAM:
#   bash scripts/vps-supabase-docker-setup.sh
#
# Docs: https://supabase.com/docs/guides/self-hosting/docker

set -euo pipefail

MIN_RAM_MB=3500
FREE_MB="$(awk '/MemAvailable/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo 0)"

if [[ "${FREE_MB}" -lt "${MIN_RAM_MB}" ]]; then
  echo "ERROR: Need at least ~4GB RAM for full Supabase Docker stack."
  echo "Available memory: ~${FREE_MB}MB"
  echo
  echo "Options:"
  echo "  A) Upgrade VPS to 4–8GB RAM, then re-run this script"
  echo "  B) Use Postgres-only (fits your current VPS): bash scripts/vps-postgres-setup.sh"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Installing Docker..."
  dnf install -y dnf-plugins-core
  dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
  dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable --now docker
fi

SUPABASE_DIR="${SUPABASE_DIR:-/opt/supabase}"
mkdir -p "${SUPABASE_DIR}"
cd "${SUPABASE_DIR}"

if [[ ! -d supabase/docker ]]; then
  git clone --depth 1 https://github.com/supabase/supabase.git
fi

cd supabase/docker
cp .env.example .env

echo "==> Generating secrets..."
if command -v openssl >/dev/null 2>&1; then
  POSTGRES_PASSWORD="$(openssl rand -hex 16)"
  JWT_SECRET="$(openssl rand -base64 32)"
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|" .env
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
fi

echo "==> Starting Supabase (this uses significant RAM)..."
docker compose pull
docker compose up -d

echo
echo "Supabase starting at http://YOUR_VPS_IP:8000 (Studio)"
echo "Postgres: postgresql://postgres:${POSTGRES_PASSWORD}@127.0.0.1:5432/postgres"
echo
echo "Edit docker/.env for SITE_URL, API keys, then configure apps/web/.env.local:"
echo "  NEXT_PUBLIC_SUPABASE_URL=http://YOUR_VPS_IP:8000"
echo "  DATABASE_URL=postgresql://postgres:PASSWORD@127.0.0.1:5432/postgres"
echo
echo "See: https://supabase.com/docs/guides/self-hosting/docker"
