#!/usr/bin/env bash
# Allow PostgreSQL 17 on the VPS to accept TCP connections from specific client IP(s).
# Run as root on the VPS (after vps-postgres-setup.sh).
#
# Restrict to your home/office IP (recommended):
#   ALLOW_IP='203.0.113.50' bash scripts/vps-postgres-remote-access.sh
#
# Multiple IPs (comma-separated):
#   ALLOW_IP='203.0.113.50,198.51.100.10' bash scripts/vps-postgres-remote-access.sh
#
# CIDR block:
#   ALLOW_CIDR='203.0.113.0/24' bash scripts/vps-postgres-remote-access.sh
#
# Open to the world (NOT recommended):
#   ALLOW_ANY=1 bash scripts/vps-postgres-remote-access.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/pg17-tools.sh
source "${ROOT}/scripts/lib/pg17-tools.sh"

DB_NAME="${DB_NAME:-icrowd}"
DB_USER="${DB_USER:-icrowd}"
ALLOW_IP="${ALLOW_IP:-}"
ALLOW_CIDR="${ALLOW_CIDR:-}"
ALLOW_ANY="${ALLOW_ANY:-0}"
OPEN_FIREWALL="${OPEN_FIREWALL:-1}"

if [[ "${ALLOW_ANY}" != "1" && -z "${ALLOW_IP}" && -z "${ALLOW_CIDR}" ]]; then
  echo "Set ALLOW_IP, ALLOW_CIDR, or ALLOW_ANY=1 (insecure)."
  echo "  ALLOW_IP='YOUR_PUBLIC_IP' bash scripts/vps-postgres-remote-access.sh"
  exit 1
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root on the VPS."
  exit 1
fi

ensure_pg17_server

PG_HBA="$(pg_hba_file)"
PG_CONF="$(pg_conf_file)"

if [[ -z "${PG_HBA}" || ! -f "${PG_HBA}" ]]; then
  echo "ERROR: Could not find pg_hba.conf"
  exit 1
fi
if [[ -z "${PG_CONF}" || ! -f "${PG_CONF}" ]]; then
  echo "ERROR: Could not find postgresql.conf"
  exit 1
fi

echo "==> Listening on all interfaces (port 5432)..."
if grep -qE '^[#[:space:]]*listen_addresses' "${PG_CONF}"; then
  sed -i "s/^[#[:space:]]*listen_addresses.*/listen_addresses = '*'/" "${PG_CONF}"
else
  cat >> "${PG_CONF}" <<'CONF'

# icrowd remote access
listen_addresses = '*'
CONF
fi

cidrs=()
if [[ "${ALLOW_ANY}" == "1" ]]; then
  echo "WARNING: Allowing password auth from ANY IPv4 address."
  cidrs+=("0.0.0.0/0")
elif [[ -n "${ALLOW_CIDR}" ]]; then
  cidrs+=("${ALLOW_CIDR}")
fi
if [[ -n "${ALLOW_IP}" ]]; then
  IFS=',' read -ra ips <<< "${ALLOW_IP}"
  for ip in "${ips[@]}"; do
    ip="$(echo "${ip}" | tr -d '[:space:]')"
    [[ -n "${ip}" ]] || continue
    if [[ "${ip}" == */* ]]; then
      cidrs+=("${ip}")
    else
      cidrs+=("${ip}/32")
    fi
  done
fi

for cidr in "${cidrs[@]}"; do
  marker="# icrowd remote ${cidr}"
  if grep -qF "${marker}" "${PG_HBA}"; then
    echo "    pg_hba already has rule for ${cidr}"
    continue
  fi
  echo "==> pg_hba: allow ${DB_USER}@${DB_NAME} from ${cidr}"
  cat >> "${PG_HBA}" <<HBA

${marker}
host    ${DB_NAME}          ${DB_USER}          ${cidr}                  scram-sha-256
HBA
done

systemctl restart postgresql-17

if [[ "${OPEN_FIREWALL}" == "1" ]] && command -v firewall-cmd >/dev/null 2>&1; then
  systemctl enable --now firewalld 2>/dev/null || true
  if systemctl is-active --quiet firewalld; then
    if [[ "${ALLOW_ANY}" == "1" ]]; then
      echo "==> firewalld: opening 5432/tcp globally"
      firewall-cmd --permanent --add-port=5432/tcp
    else
      for cidr in "${cidrs[@]}"; do
        echo "==> firewalld: allow 5432/tcp from ${cidr}"
        firewall-cmd --permanent --add-rich-rule="rule family=\"ipv4\" source address=\"${cidr}\" port protocol=\"tcp\" port=\"5432\" accept"
      done
    fi
    firewall-cmd --reload
  else
    echo "NOTE: firewalld not active — ensure port 5432 is reachable (cloud panel / iptables)."
  fi
fi

PUBLIC_IP="$(curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || true)"

echo
echo "==> Remote Postgres enabled =="
echo "Connect from an allowed client, e.g.:"
echo "  postgresql://${DB_USER}:PASSWORD@${PUBLIC_IP:-YOUR_VPS_IP}:5432/${DB_NAME}"
echo
echo "Test from your machine:"
echo "  psql \"postgresql://${DB_USER}:PASSWORD@${PUBLIC_IP:-216.10.251.167}:5432/${DB_NAME}\" -c 'SELECT 1'"
echo
echo "Revoke: remove lines marked '# icrowd remote' in pg_hba.conf, set listen_addresses = 'localhost', restart postgresql-17, remove firewalld rules for 5432."
