#!/usr/bin/env bash
# Provision a swap file on a small VPS so Next.js builds don't OOM.
#
# Why: a fresh AlmaLinux droplet typically has 0 MB of swap. `npm ci` +
# `next build` can momentarily spike RAM past 1.5 GB, causing ENOMEM and
# process kills mid-deploy. 2 GB of swap absorbs that spike for cheap.
#
# Run ONCE as root on the VPS:
#   sudo bash scripts/setup-swap.sh
#
# Idempotent — safe to re-run.

set -euo pipefail

SWAP_FILE="${SWAP_FILE:-/swapfile}"
SWAP_SIZE_GB="${SWAP_SIZE_GB:-2}"
SWAPPINESS="${SWAPPINESS:-10}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo bash scripts/setup-swap.sh"
  exit 1
fi

current_swap_kb="$(awk '/SwapTotal/ {print $2}' /proc/meminfo)"
if [[ "${current_swap_kb}" -gt 0 ]]; then
  echo "==> Swap is already enabled ($(( current_swap_kb / 1024 )) MB total). Skipping."
else
  echo "==> Creating ${SWAP_SIZE_GB}GB swap file at ${SWAP_FILE}..."
  if [[ ! -f "${SWAP_FILE}" ]]; then
    # fallocate fails on some filesystems (e.g. older xfs); fall back to dd.
    if ! fallocate -l "${SWAP_SIZE_GB}G" "${SWAP_FILE}" 2>/dev/null; then
      dd if=/dev/zero of="${SWAP_FILE}" bs=1M count=$(( SWAP_SIZE_GB * 1024 )) status=progress
    fi
  fi

  chmod 600 "${SWAP_FILE}"
  mkswap "${SWAP_FILE}"
  swapon "${SWAP_FILE}"

  if ! grep -q "^${SWAP_FILE} " /etc/fstab; then
    echo "${SWAP_FILE} none swap sw 0 0" >> /etc/fstab
  fi
fi

echo "==> Tuning vm.swappiness=${SWAPPINESS} (keep RAM hot, only swap under pressure)..."
sysctl -w "vm.swappiness=${SWAPPINESS}" >/dev/null
if [[ -f /etc/sysctl.conf ]]; then
  if grep -q '^vm.swappiness' /etc/sysctl.conf; then
    sed -i "s/^vm.swappiness=.*/vm.swappiness=${SWAPPINESS}/" /etc/sysctl.conf
  else
    echo "vm.swappiness=${SWAPPINESS}" >> /etc/sysctl.conf
  fi
fi

echo ""
echo "==> Memory state:"
free -h
echo ""
echo "Done. Swap is permanent — survives reboots."
