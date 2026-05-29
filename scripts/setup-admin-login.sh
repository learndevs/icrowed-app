#!/usr/bin/env bash
# Recreate auth schema + admin@icrowed.local on VPS local Postgres.
# Run on VPS as root:
#   cd /var/www/icrowed-app
#   ADMIN_PASSWORD='your-password' bash scripts/setup-admin-login.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/icrowed-app}"
cd "${APP_DIR}"

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@icrowed.local}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"
ADMIN_NAME="${ADMIN_NAME:-Admin}"
APP_DB_USER="${APP_DB_USER:-icrowd}"
PG_DB="${PG_DB:-icrowd}"

ENV_FILE="${APP_DIR}/apps/web/.env"
[[ -f "${ENV_FILE}" ]] || ENV_FILE="${APP_DIR}/apps/web/.env.local"

SQL_TEMPLATE="${APP_DIR}/scripts/setup-admin-login.sql"

echo "=== iCrowd admin login setup ==="

if [[ -z "${ADMIN_PASSWORD}" ]]; then
  echo "Set ADMIN_PASSWORD, e.g.:"
  echo "  ADMIN_PASSWORD='YourSecurePassword' bash scripts/setup-admin-login.sh"
  exit 1
fi

if [[ ! -f "${SQL_TEMPLATE}" ]]; then
  echo "Missing ${SQL_TEMPLATE}"
  exit 1
fi

# Escape single quotes for SQL string literals
sql_escape() {
  printf "%s" "$1" | sed "s/'/''/g"
}

EMAIL_SQL="$(sql_escape "${ADMIN_EMAIL}")"
PASS_SQL="$(sql_escape "${ADMIN_PASSWORD}")"
NAME_SQL="$(sql_escape "${ADMIN_NAME}")"

render_sql() {
  sed \
    -e "s/__ADMIN_EMAIL__/${EMAIL_SQL}/g" \
    -e "s/__ADMIN_PASSWORD__/${PASS_SQL}/g" \
    -e "s/__ADMIN_NAME__/${NAME_SQL}/g" \
    "${SQL_TEMPLATE}"
}

if [[ -f "${ENV_FILE}" ]]; then
  db_url="$(grep -E '^DATABASE_URL=' "${ENV_FILE}" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
  echo "App DATABASE_URL (masked): $(echo "${db_url}" | sed 's/:[^:@/]*@/:***@/')"
  if echo "${db_url}" | grep -qi 'supabase\.com'; then
    echo ""
    echo "WARNING: DATABASE_URL still points to Supabase Cloud."
    echo "This script sets up LOCAL database '${PG_DB}'."
    echo ""
    read -r -p "Continue with local DB '${PG_DB}' anyway? [y/N] " ans
    [[ "${ans}" =~ ^[yY] ]] || exit 1
  fi
  if echo "${db_url}" | grep -qE '@(127\.0\.0\.1|localhost)'; then
    PG_DB="$(echo "${db_url}" | sed -n 's|.*/\([^?]*\).*|\1|p')"
    APP_DB_USER="$(echo "${db_url}" | sed -n 's|.*://\([^:@]*\).*|\1|p')"
  fi
fi

PSQL=(sudo -u postgres psql)
if ! command -v psql &>/dev/null && [[ -x /usr/pgsql-17/bin/psql ]]; then
  PSQL=(sudo -u postgres /usr/pgsql-17/bin/psql)
fi

echo ""
echo "==> Recreating auth schema + ${ADMIN_EMAIL} on database: ${PG_DB}"
render_sql | "${PSQL[@]}" -d "${PG_DB}" -v ON_ERROR_STOP=1 -f -

echo ""
echo "==> Test login query AS app user (${APP_DB_USER})..."
LOCAL_URL=""
if [[ -f "${APP_DIR}/.postgres-local.env" ]]; then
  # shellcheck disable=SC1090
  source "${APP_DIR}/.postgres-local.env"
  LOCAL_URL="${LOCAL_DATABASE_URL:-}"
fi
if [[ -z "${LOCAL_URL}" && -f "${ENV_FILE}" ]]; then
  LOCAL_URL="$(grep -E '^DATABASE_URL=' "${ENV_FILE}" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
fi

if [[ -n "${LOCAL_URL}" ]] && echo "${LOCAL_URL}" | grep -qE '@(127\.0\.0\.1|localhost)'; then
  EMAIL_TEST="$(sql_escape "${ADMIN_EMAIL}")"
  PASS_TEST="$(sql_escape "${ADMIN_PASSWORD}")"
  if PGPASSWORD="" psql "${LOCAL_URL}" -v ON_ERROR_STOP=1 -c "
    SELECT u.id, p.email, p.role::text
    FROM auth.users u
    INNER JOIN profiles p ON p.id = u.id
    WHERE lower(u.email) = lower('${EMAIL_TEST}')
      AND u.encrypted_password = crypt('${PASS_TEST}', u.encrypted_password)
      AND p.is_active = true
      AND p.role::text IN ('admin', 'operator');
  " 2>/dev/null; then
    echo "OK: App user can run login query."
  else
    echo "FAIL: App user cannot run login query — check grants or password."
    exit 1
  fi
else
  echo "Skip app-user test (no local DATABASE_URL)."
fi

echo ""
echo "============================================"
echo "Admin login ready."
echo "  Email:    ${ADMIN_EMAIL}"
echo "  Password: (what you set in ADMIN_PASSWORD)"
echo "  URL:      /admin/login"
echo ""
echo "Restart app:"
echo "  sudo -u icrowd pm2 restart icrowd-web"
echo "============================================"
