-- Let the app DB user (icrowd) read auth tables for admin login.
-- Run on VPS after bootstrap-local-auth.sql:
--   sudo -u postgres psql -d icrowd -f /var/www/icrowed-app/scripts/grant-auth-app-user.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

GRANT USAGE ON SCHEMA auth TO icrowd;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO icrowd;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth TO icrowd;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO icrowd;
