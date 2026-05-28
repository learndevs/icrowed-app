#!/usr/bin/env bash
# Install PostgreSQL on AlmaLinux/RHEL VPS for iCrowd app data.
# Auth + Storage stay on Supabase Cloud; only DATABASE_URL moves to localhost.
#
# Run as root on VPS:
#   DB_PASSWORD='your-secure-password' bash scripts/vps-postgres-setup.sh
#
# Then migrate data:
#   bash scripts/migrate-supabase-db-to-local.sh
#
# Then update apps/web/.env.local:
#   DATABASE_URL=postgresql://icrowd:PASSWORD@127.0.0.1:5432/icrowd
#   (keep NEXT_PUBLIC_SUPABASE_* keys unchanged)

set -euo pipefail

DB_NAME="${DB_NAME:-icrowd}"
DB_USER="${DB_USER:-icrowd}"
DB_PASSWORD="${DB_PASSWORD:-}"

if [[ -z "${DB_PASSWORD}" ]]; then
  echo "Set DB_PASSWORD before running, e.g.:"
  echo "  DB_PASSWORD='$(openssl rand -base64 24)' bash scripts/vps-postgres-setup.sh"
  exit 1
fi

echo "==> Installing PostgreSQL..."
if ! command -v psql >/dev/null 2>&1; then
  dnf install -y postgresql-server postgresql-contrib
  postgresql-setup --initdb || /usr/bin/postgresql-setup --initdb
fi

systemctl enable --now postgresql

PG_HBA="$(sudo -u postgres psql -tAc "SHOW hba_file;" | tr -d '[:space:]')"
PG_CONF="$(sudo -u postgres psql -tAc "SHOW config_file;" | tr -d '[:space:]')"

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

systemctl restart postgresql

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

echo
echo "==> PostgreSQL ready =="
echo "DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}"
echo
echo "Next steps:"
echo "  1. bash scripts/migrate-supabase-db-to-local.sh"
echo "  2. Update apps/web/.env.local with DATABASE_URL above"
echo "  3. cd /var/www/icrowed-app && ./scripts/rebuild-and-restart.sh"
echo
echo "Keep NEXT_PUBLIC_SUPABASE_URL and SUPABASE keys — auth & image storage still use Supabase Cloud."
