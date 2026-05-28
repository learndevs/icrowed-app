#!/usr/bin/env bash
# Create site_reviews table + seed home page testimonials on local VPS Postgres.
#
# Run on VPS from repo root:
#   bash scripts/vps-add-site-reviews.sh
#
# Or with an explicit connection string:
#   LOCAL_DATABASE_URL='postgresql://icrowd:YOUR_PASS@127.0.0.1:5432/icrowd' \
#     bash scripts/vps-add-site-reviews.sh
#
# Or one-shot with psql only:
#   /usr/pgsql-17/bin/psql "postgresql://icrowd:YOUR_PASS@127.0.0.1:5432/icrowd" \
#     -f packages/database/migrations/0007_site_reviews.sql

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/pg17-tools.sh
source "${ROOT}/scripts/lib/pg17-tools.sh"

ENV_FILE="${ENV_FILE:-${ROOT}/apps/web/.env.local}"
LOCAL_CREDS="${LOCAL_CREDS:-${ROOT}/.postgres-local.env}"
SQL_FILE="${ROOT}/packages/database/migrations/0007_site_reviews.sql"

DB_NAME="${DB_NAME:-icrowd}"
DB_USER="${DB_USER:-icrowd}"
DB_PASSWORD="${DB_PASSWORD:-}"

load_env_var() {
  local key="$1"
  local file="$2"
  grep -E "^${key}=" "${file}" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' || true
}

LOCAL_DATABASE_URL="${LOCAL_DATABASE_URL:-}"

if [[ -f "${LOCAL_CREDS}" ]]; then
  # shellcheck disable=SC1090
  source "${LOCAL_CREDS}"
  LOCAL_DATABASE_URL="${LOCAL_DATABASE_URL:-}"
fi

if [[ -z "${LOCAL_DATABASE_URL}" && -f "${ENV_FILE}" ]]; then
  url="$(load_env_var DATABASE_URL "${ENV_FILE}")"
  if [[ "${url}" == *"@127.0.0.1"* || "${url}" == *"@localhost"* ]]; then
    LOCAL_DATABASE_URL="${url}"
  fi
fi

if [[ -z "${LOCAL_DATABASE_URL}" && -n "${DB_PASSWORD}" ]]; then
  LOCAL_DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}"
fi

if [[ -z "${LOCAL_DATABASE_URL}" ]]; then
  echo "ERROR: Could not resolve LOCAL_DATABASE_URL."
  echo "Set one of:"
  echo "  LOCAL_DATABASE_URL='postgresql://icrowd:pass@127.0.0.1:5432/icrowd'"
  echo "  DB_PASSWORD='pass' (with optional DB_USER / DB_NAME)"
  echo "  DATABASE_URL in ${ENV_FILE} pointing at localhost"
  exit 1
fi

if [[ ! -f "${SQL_FILE}" ]]; then
  echo "ERROR: Missing ${SQL_FILE}"
  exit 1
fi

PSQL="$(command -v psql 2>/dev/null || true)"
if [[ -x /usr/pgsql-17/bin/psql ]]; then
  PSQL="/usr/pgsql-17/bin/psql"
fi
if [[ -z "${PSQL}" ]]; then
  echo "ERROR: psql not found. Install PostgreSQL client first."
  exit 1
fi

echo "==> Applying site_reviews migration..."
echo "    SQL: ${SQL_FILE}"
"${PSQL}" "${LOCAL_DATABASE_URL}" -v ON_ERROR_STOP=1 -f "${SQL_FILE}"

echo ""
echo "==> Done. Current rows:"
"${PSQL}" "${LOCAL_DATABASE_URL}" -c \
  "SELECT reviewer_name, rating, left(body, 60) AS preview FROM site_reviews ORDER BY created_at DESC;"
