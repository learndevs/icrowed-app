#!/usr/bin/env bash
# Copy public schema data from Supabase Cloud Postgres → local VPS Postgres.
# Run on VPS after vps-postgres-setup.sh (needs pg_dump / pg_restore).
#
# Usage (on VPS, from repo root):
#   SUPABASE_DATABASE_URL='postgresql://postgres.xxx:pass@...pooler...:5432/postgres' \
#   LOCAL_DATABASE_URL='postgresql://icrowd:pass@127.0.0.1:5432/icrowd' \
#   bash scripts/migrate-supabase-db-to-local.sh
#
# Or load from apps/web/.env.local if SUPABASE_DATABASE_URL is not set:
#   uses DIRECT_URL (5432 session) or DATABASE_URL with port forced to 5432

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/pg17-tools.sh
source "${ROOT}/scripts/lib/pg17-tools.sh"

ENV_FILE="${ENV_FILE:-${ROOT}/apps/web/.env.local}"
LOCAL_CREDS="${LOCAL_CREDS:-${ROOT}/.postgres-local.env}"

LOCAL_DATABASE_URL="${LOCAL_DATABASE_URL:-}"
SUPABASE_DATABASE_URL="${SUPABASE_DATABASE_URL:-}"
DUMP="/tmp/icrowd-public-$(date +%Y%m%d).dump"

DB_NAME="${DB_NAME:-icrowd}"
DB_USER="${DB_USER:-icrowd}"
DB_PASSWORD="${DB_PASSWORD:-}"

load_env_var() {
  local key="$1"
  local file="$2"
  grep -E "^${key}=" "${file}" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' || true
}

if [[ -f "${LOCAL_CREDS}" ]]; then
  # shellcheck disable=SC1090
  source "${LOCAL_CREDS}"
  LOCAL_DATABASE_URL="${LOCAL_DATABASE_URL:-}"
fi

if [[ -z "${LOCAL_DATABASE_URL}" && -n "${DB_PASSWORD}" ]]; then
  LOCAL_DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}"
fi

if [[ -z "${SUPABASE_DATABASE_URL}" && -f "${ENV_FILE}" ]]; then
  SUPABASE_DATABASE_URL="$(load_env_var DIRECT_URL "${ENV_FILE}")"
  if [[ -z "${SUPABASE_DATABASE_URL}" ]]; then
    src="$(load_env_var DATABASE_URL "${ENV_FILE}")"
    # Session pooler required for pg_dump (not transaction mode 6543)
    SUPABASE_DATABASE_URL="${src/:6543/:5432}"
    SUPABASE_DATABASE_URL="${SUPABASE_DATABASE_URL//\?pgbouncer=true/}"
  fi
fi

if [[ -z "${LOCAL_DATABASE_URL}" && -f "${ENV_FILE}" ]]; then
  LOCAL_DATABASE_URL="$(load_env_var DATABASE_URL "${ENV_FILE}")"
  if [[ "${LOCAL_DATABASE_URL}" == *"supabase.com"* ]]; then
    LOCAL_DATABASE_URL=""
  fi
fi

if [[ -z "${LOCAL_DATABASE_URL}" ]]; then
  echo "Local Postgres URL not found."
  echo
  echo "Run setup first:"
  echo "  DB_PASSWORD='your-password' bash scripts/vps-postgres-setup.sh"
  echo
  echo "Or pass LOCAL_DATABASE_URL explicitly:"
  echo "  LOCAL_DATABASE_URL='postgresql://icrowd:PASSWORD@127.0.0.1:5432/icrowd' bash scripts/migrate-supabase-db-to-local.sh"
  exit 1
fi

if [[ -z "${SUPABASE_DATABASE_URL}" || -z "${LOCAL_DATABASE_URL}" ]]; then
  echo "Set SUPABASE_DATABASE_URL and LOCAL_DATABASE_URL"
  exit 1
fi

ensure_pg17_client

mask_url() { echo "$1" | sed 's/:[^:@/]*@/:***@/'; }

echo "==> Dumping public schema from Supabase..."
echo "    $(mask_url "${SUPABASE_DATABASE_URL}")"
echo "    using $(pg_dump --version)"
pg_dump "${SUPABASE_DATABASE_URL}" \
  --schema=public \
  --no-owner \
  --no-acl \
  --format=custom \
  --file="${DUMP}"

echo "==> Restoring into local Postgres..."
echo "    $(mask_url "${LOCAL_DATABASE_URL}")"
pg_restore \
  --dbname="${LOCAL_DATABASE_URL}" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  "${DUMP}"

echo "==> Verifying row counts..."
psql "${LOCAL_DATABASE_URL}" -c "
SELECT 'products' AS tbl, COUNT(*)::text FROM products
UNION ALL SELECT 'delivery_types', COUNT(*)::text FROM delivery_types
UNION ALL SELECT 'profiles', COUNT(*)::text FROM profiles;
"

rm -f "${DUMP}"
echo "Done. Update DATABASE_URL to local and restart PM2."
