#!/usr/bin/env bash
# Upload local apps/web/.env.local to the AlmaLinux server as apps/web/.env
# Run from repo root on your Mac: bash scripts/upload-env.sh

set -euo pipefail

SERVER="${SERVER:-root@216.10.251.167}"
SSH_PORT="${SSH_PORT:-22}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/icrowed-app/apps/web}"
APP_URL="${APP_URL:-http://216.10.251.167}"
SCP_OPTS=(-P "${SSH_PORT}")
SRC="apps/web/.env.local"
TMP="$(mktemp)"

if [[ ! -f "$SRC" ]]; then
  echo "Missing $SRC"
  exit 1
fi

python3 - "$SRC" "$TMP" "$APP_URL" <<'PY'
import sys
from pathlib import Path

src, tmp, app_url = sys.argv[1:4]
lines = []
for line in Path(src).read_text().splitlines():
    if line.startswith("NEXT_PUBLIC_APP_URL="):
        lines.append(f"NEXT_PUBLIC_APP_URL={app_url}")
    elif line.startswith("STRIPE_SECRET_KEY=") and line.strip() == "STRIPE_SECRET_KEY=":
        lines.append("STRIPE_SECRET_KEY=sk_test_placeholder")
    elif line.startswith("STRIPE_WEBHOOK_SECRET=") and line.strip() == "STRIPE_WEBHOOK_SECRET=":
        lines.append("STRIPE_WEBHOOK_SECRET=whsec_placeholder")
    else:
        lines.append(line)

keys = {l.split("=", 1)[0] for l in lines if "=" in l and not l.startswith("#")}
for key, value in [
    ("RESEND_API_KEY", "re_placeholder_replace_me"),
    ("EMAIL_FROM", "orders@icrowed.com"),
]:
    if key not in keys:
        lines.append(f"{key}={value}")

Path(tmp).write_text("\n".join(lines) + "\n")
PY

echo "Uploading env to ${SERVER}:${REMOTE_DIR}/.env (SSH port ${SSH_PORT})"
scp "${SCP_OPTS[@]}" "$TMP" "${SERVER}:${REMOTE_DIR}/.env"
rm -f "$TMP"
echo "Done. On the server run:"
echo "  cd /var/www/icrowed-app && npm run netlify:build && pm2 restart icrowed-web || pm2 start npm --name icrowed-web -- start --workspace=web"
