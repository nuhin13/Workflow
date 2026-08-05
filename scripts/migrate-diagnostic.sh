#!/usr/bin/env bash
# E00-T04 · explicit migration runner, generalised by E01-T02 beyond the
# single diagnostic migration.
#
# Migrations NEVER run at application startup. A process that migrates on boot
# will, sooner or later, migrate from three replicas at once, or migrate a
# production database because someone started a container with the wrong
# environment. Running them is a deliberate act with a human behind it.
#
# Usage: scripts/migrate-diagnostic.sh up|down|status [migration]
#
# `migration` is an exact migration id (e.g. `0002_access_workshop`). Omit it
# to default to `0001_system_probe` — this keeps every existing caller
# (Makefile's `migrate-diagnostic`/`migrate-diagnostic-down` targets, the E00
# integration/e2e suites, docs/operations/local-development.md) working
# unchanged. Pass `all` to apply/revert every migration under
# infra/db/migrations in order (ascending for up, descending for down).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DIRECTION="${1:-}"
MIGRATION_ARG="${2:-0001_system_probe}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "migrate: DATABASE_URL is not set" >&2
  echo "migrate: for local development, start the stack and use the value from .env.example" >&2
  exit 2
fi

# Refuse to touch production from this script. The production migration path is
# the deploy runbook, with an operator and a recorded approval — not a
# convenience script that a mistyped environment could point anywhere.
if [[ "${APP_ENV:-development}" == "production" ]]; then
  echo "migrate: refusing to run against APP_ENV=production" >&2
  echo "migrate: production migrations follow infra/vm/deploy-runbook.md" >&2
  exit 2
fi

# psql is not assumed to be installed on the host; the official client image is
# used instead so the runner behaves identically everywhere.
run_sql() {
  local file="$1"
  docker run --rm --network host \
    -e PGCONNECT_TIMEOUT=10 \
    -v "$ROOT/infra/db:/db:ro" \
    postgres:17-alpine \
    psql "$DATABASE_URL" --set ON_ERROR_STOP=1 -f "/db/${file#infra/db/}"
}

table_for_migration() {
  case "$1" in
    0001_system_probe) echo "system_probes" ;;
    0002_access_workshop) echo "workshops" ;;
    *) echo "" ;;
  esac
}

# All migration ids present on disk, sorted ascending by filename (the
# leading zero-padded number is what makes lexical sort equal numeric sort).
all_migrations() {
  find "$ROOT/infra/db/migrations" -maxdepth 1 -name '*.up.sql' -print \
    | xargs -n1 basename \
    | sed 's/\.up\.sql$//' \
    | sort
}

resolve_migrations_ascending() {
  if [[ "$MIGRATION_ARG" == "all" ]]; then
    all_migrations
  else
    echo "$MIGRATION_ARG"
  fi
}

resolve_migrations_descending() {
  resolve_migrations_ascending | awk '{ lines[NR] = $0 } END { for (i = NR; i >= 1; i--) print lines[i] }'
}

case "$DIRECTION" in
  up)
    while IFS= read -r migration; do
      echo "migrate: applying $migration"
      run_sql "infra/db/migrations/${migration}.up.sql"
      echo "migrate: $migration applied"
    done < <(resolve_migrations_ascending)
    ;;
  down)
    # Reverse order on the way down: a later migration's tables may reference
    # an earlier one's (foreign keys), so undoing them out of order would fail
    # partway through and leave a partial schema.
    while IFS= read -r migration; do
      echo "migrate: reverting $migration"
      run_sql "infra/db/migrations/${migration}.down.sql"
      echo "migrate: $migration reverted"
    done < <(resolve_migrations_descending)
    ;;
  status)
    while IFS= read -r migration; do
      table="$(table_for_migration "$migration")"
      if [[ -z "$table" ]]; then
        echo "migrate: $migration: unknown migration id" >&2
        exit 2
      fi
      state=$(docker run --rm --network host -e PGCONNECT_TIMEOUT=10 postgres:17-alpine \
        psql "$DATABASE_URL" --set ON_ERROR_STOP=1 -tAc \
        "SELECT CASE WHEN to_regclass('public.${table}') IS NULL
                     THEN 'not applied' ELSE 'applied' END;")
      echo "$migration: $state"
    done < <(resolve_migrations_ascending)
    ;;
  *)
    echo "usage: scripts/migrate-diagnostic.sh up|down|status [migration]" >&2
    exit 2
    ;;
esac
