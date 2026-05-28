#!/usr/bin/env bash
# Shared helpers: install PostgreSQL 17 from PGDG (Supabase Cloud runs PG 17).

pg_el_version() {
  local el
  el="$(rpm -E '%{rhel}' 2>/dev/null || true)"
  if [[ -n "${el}" && "${el}" != "%{rhel}" ]]; then
    echo "${el}"
    return
  fi
  # shellcheck disable=SC1091
  . /etc/os-release
  echo "${VERSION_ID%%.*}"
}

pg_bin_dir() {
  if [[ -x /usr/pgsql-17/bin/pg_dump ]]; then
    echo /usr/pgsql-17/bin
  elif command -v pg_dump >/dev/null 2>&1; then
    dirname "$(command -v pg_dump)"
  fi
}

pg_tool_major() {
  local tool="${1:-pg_dump}"
  local bindir
  bindir="$(pg_bin_dir)"
  if [[ -z "${bindir}" || ! -x "${bindir}/${tool}" ]]; then
    echo 0
    return
  fi
  "${bindir}/${tool}" --version 2>/dev/null | sed -n 's/.*) \([0-9]*\).*/\1/p'
}

install_pgdg_postgresql17() {
  local pkg_type="${1:-client}" # client | server
  local el
  el="$(pg_el_version)"

  echo "==> Adding PostgreSQL PGDG repo (EL-${el})..."
  dnf install -y "https://download.postgresql.org/pub/repos/yum/reporpms/EL-${el}-x86_64/pgdg-redhat-repo-latest.noarch.rpm"
  dnf -qy module disable postgresql 2>/dev/null || true

  if [[ "${pkg_type}" == "server" ]]; then
    dnf install -y postgresql17-server postgresql17-contrib
    dnf install -y postgresql17 || true
  else
    dnf install -y postgresql17
  fi
}

ensure_pg17_client() {
  local major
  major="$(pg_tool_major pg_dump)"
  if [[ "${major}" -ge 15 ]]; then
    export PATH="$(pg_bin_dir):${PATH}"
    return 0
  fi

  echo "==> pg_dump is v${major:-missing}; Supabase needs >= 15. Installing PostgreSQL 17 client..."
  install_pgdg_postgresql17 client
  export PATH="/usr/pgsql-17/bin:${PATH}"

  major="$(pg_tool_major pg_dump)"
  if [[ "${major}" -lt 15 ]]; then
    echo "ERROR: Could not install a modern pg_dump (got v${major})."
    exit 1
  fi
  echo "==> Using pg_dump $(pg_dump --version)"
}

ensure_pg17_server() {
  if systemctl is-active postgresql-17 >/dev/null 2>&1; then
    export PATH="/usr/pgsql-17/bin:${PATH}"
    return 0
  fi

  echo "==> Installing PostgreSQL 17 server..."
  install_pgdg_postgresql17 server

  # Old distro PostgreSQL (v10–13) also binds :5432 — stop it.
  if systemctl is-active postgresql >/dev/null 2>&1; then
    echo "==> Stopping legacy postgresql service (old version on port 5432)..."
    systemctl stop postgresql
    systemctl disable postgresql 2>/dev/null || true
  fi

  if [[ ! -f /var/lib/pgsql/17/data/PG_VERSION ]]; then
    /usr/pgsql-17/bin/postgresql-17-setup initdb
  fi

  systemctl enable --now postgresql-17
  export PATH="/usr/pgsql-17/bin:${PATH}"
  echo "==> PostgreSQL 17 server running ($(psql -V))"
}

pg_psql() {
  ensure_pg17_client >/dev/null 2>&1 || true
  if [[ -x /usr/pgsql-17/bin/psql ]]; then
    /usr/pgsql-17/bin/psql "$@"
  else
    psql "$@"
  fi
}

pg_hba_file() {
  pg_psql -tAc "SHOW hba_file;" 2>/dev/null | tr -d '[:space:]'
}

pg_conf_file() {
  pg_psql -tAc "SHOW config_file;" 2>/dev/null | tr -d '[:space:]'
}
