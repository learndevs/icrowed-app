#!/usr/bin/env bash
# Check or change SSH port on AlmaLinux / RHEL (run as root ON THE SERVER).
#
# Check current port only:
#   bash configure-ssh-port.sh
#
# Change to port 2222 (keeps 22 open until you confirm the new port works):
#   bash configure-ssh-port.sh 2222
#
# After verifying `ssh -p 2222 root@YOUR_IP`, remove the old port:
#   bash configure-ssh-port.sh --finalize 2222

set -euo pipefail

SSHD_CONFIG="/etc/ssh/sshd_config"
D="${SSHD_CONFIG}.d/99-icrowd-port.conf"

current_port() {
  local p
  p="$(grep -E '^[[:space:]]*Port[[:space:]]+' "$SSHD_CONFIG" 2>/dev/null | awk '{print $2}' | tail -1 || true)"
  if [[ -z "$p" ]] && [[ -f "$D" ]]; then
    p="$(grep -E '^[[:space:]]*Port[[:space:]]+' "$D" 2>/dev/null | awk '{print $2}' | tail -1 || true)"
  fi
  echo "${p:-22}"
}

listening_ports() {
  ss -tlnp 2>/dev/null | grep sshd || true
}

firewall_ports() {
  if systemctl is-active --quiet firewalld; then
    firewall-cmd --list-ports 2>/dev/null || true
    firewall-cmd --list-services 2>/dev/null || true
  else
    echo "(firewalld not active)"
  fi
}

echo "==> SSH port check"
echo "  Configured port: $(current_port)"
echo "  Listening:"
listening_ports | sed 's/^/    /'
echo "  Firewall:"
firewall_ports | sed 's/^/    /'

if [[ "${1:-}" == "--finalize" ]]; then
  NEW_PORT="${2:?Usage: $0 --finalize NEW_PORT}"
  echo ""
  echo "==> Finalizing: SSH on port ${NEW_PORT} only (removing port 22)"
  rm -f "$D"
  if grep -qE '^[[:space:]]*Port[[:space:]]+' "$SSHD_CONFIG"; then
    sed -i -E "s/^[[:space:]]*Port[[:space:]]+.*/Port ${NEW_PORT}/" "$SSHD_CONFIG"
  else
    printf '\nPort %s\n' "$NEW_PORT" >> "$SSHD_CONFIG"
  fi
  if systemctl is-active --quiet firewalld; then
    firewall-cmd --permanent --remove-service=ssh 2>/dev/null || true
    firewall-cmd --permanent --remove-port=22/tcp 2>/dev/null || true
    firewall-cmd --permanent --add-port="${NEW_PORT}/tcp"
    firewall-cmd --reload
  fi
  sshd -t
  systemctl restart sshd
  echo "Done. Connect with: ssh -p ${NEW_PORT} root@YOUR_SERVER_IP"
  exit 0
fi

NEW_PORT="${1:-}"
if [[ -z "$NEW_PORT" ]]; then
  echo ""
  echo "To change the port, run: bash $0 NEW_PORT"
  exit 0
fi

if ! [[ "$NEW_PORT" =~ ^[0-9]+$ ]] || (( NEW_PORT < 1024 || NEW_PORT > 65535 )); then
  echo "Invalid port: $NEW_PORT (use 1024-65535; 2222 is common)"
  exit 1
fi

OLD_PORT="$(current_port)"
if [[ "$NEW_PORT" == "$OLD_PORT" ]]; then
  echo "Already using port ${NEW_PORT}."
  exit 0
fi

echo ""
echo "==> Adding SSH port ${NEW_PORT} (keeping ${OLD_PORT} until you finalize)"
mkdir -p "$(dirname "$D")"
cat > "$D" <<EOF
# Added by icrowd configure-ssh-port.sh — drop-in overrides main config
Port ${OLD_PORT}
Port ${NEW_PORT}
EOF

if command -v semanage >/dev/null 2>&1; then
  semanage port -a -t ssh_port_t -p tcp "$NEW_PORT" 2>/dev/null || \
    semanage port -m -t ssh_port_t -p tcp "$NEW_PORT" 2>/dev/null || true
fi

if systemctl is-active --quiet firewalld; then
  firewall-cmd --permanent --add-port="${NEW_PORT}/tcp"
  firewall-cmd --reload
fi

sshd -t
systemctl restart sshd

echo ""
echo "============================================"
echo "SSH now listens on ${OLD_PORT} AND ${NEW_PORT}."
echo ""
echo "1. From your Mac (new terminal), test:"
echo "     ssh -p ${NEW_PORT} root@YOUR_SERVER_IP"
echo ""
echo "2. Update local scripts:"
echo "     SSH_PORT=${NEW_PORT} bash scripts/upload-env.sh"
echo ""
echo "3. Optional ~/.ssh/config entry:"
echo "     Host icrowd"
echo "       HostName YOUR_SERVER_IP"
echo "       User root"
echo "       Port ${NEW_PORT}"
echo ""
echo "4. After the new port works, disable port ${OLD_PORT}:"
echo "     bash $0 --finalize ${NEW_PORT}"
echo "============================================"
