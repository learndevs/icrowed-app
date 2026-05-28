#!/usr/bin/env bash
# Install PostgreSQL 17 on AlmaLinux/RHEL VPS for iCrowd app data.
# Auth + Storage stay on Supabase Cloud; only DATABASE_URL moves to localhost.
#
# Run as root on VPS:
#   DB_PASSWORD='your-secure-password' bash scripts/vps-postgres-setup.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/pg17-tools.sh
source "${ROOT}/scripts/lib/pg17-tools.sh"

DB_NAME="${DB_NAME:-icrowd}"
DB_USER="${DB_USER:-icrowd}"
DB_PASSWORD="${DB_PASSWORD:-}"

if [[ -z "${DB_PASSWORD}" ]]; then
  echo "Set DB_PASSWORD before running, e.g.:"
  echo "  DB_PASSWORD='$(openssl rand -base64 24)' bash scripts/vps-postgres-setup.sh"
  exit 1
fi

ensure_pg17_server

PG_HBA="$(pg_hba_file)"
PG_CONF="$(pg_conf_file)"

echo "==> Allowing local password auth..."
if ! grep -q "# icrowd local" "${PG_HBA}"; then
  cat >> "${PG_HBA}" <<'HBA'

# icrowd local
local   icrowd          icrowd                                   scram-sha-256
host    icrowd          icrowd          127.0.0.1/32             scram-sha-256
host    icrowd          icrowd          ::1/128                  scram-sha-256
HBA
fi

echo "==> Tuning for ~2GB VPS..."
if ! grep -q "# icrowd tuning" "${PG_CONF}"; then
  cat >> "${PG_CONF}" <<'CONF'

# icrowd tuning (small VPS)
shared_buffers = 128MB
effective_cache_size = 512MB
maintenance_work_mem = 64MB
work_mem = 4MB
max_connections = 40
CONF
fi

systemctl restart postgresql-17

echo "==> Creating database and user..."
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
  ELSE
    ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

sudo -u postgres psql -d "${DB_NAME}" -v ON_ERROR_STOP=1 <<SQL
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
SQL

CREDS_FILE="${ROOT}/.postgres-local.env"
cat > "${CREDS_FILE}" <<CREDS
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
LOCAL_DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}
CREDS
chmod 600 "${CREDS_FILE}"

echo
echo "==> PostgreSQL 17 ready =="
echo "DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}"
echo "(saved to ${CREDS_FILE})"
echo
echo "Next: bash scripts/migrate-supabase-db-to-local.sh"
