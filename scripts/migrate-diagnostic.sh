#!/usr/bin/env bash
# E00-T04 · explicit diagnostic migration runner.
#
# Migrations NEVER run at application startup. A process that migrates on boot
# will, sooner or later, migrate from three replicas at once, or migrate a
# production database because someone started a container with the wrong
# environment. Running them is a deliberate act with a human behind it.
#
# Usage: scripts/migrate-diagnostic.sh up|down|status
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DIRECTION="${1:-}"
MIGRATION="0001_system_probe"

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

case "$DIRECTION" in
  up)
    echo "migrate: applying $MIGRATION (diagnostic table only)"
    run_sql "infra/db/migrations/${MIGRATION}.up.sql"
    echo "migrate: $MIGRATION applied"
    ;;
  down)
    echo "migrate: reverting $MIGRATION"
    run_sql "infra/db/migrations/${MIGRATION}.down.sql"
    echo "migrate: $MIGRATION reverted"
    ;;
  status)
    docker run --rm --network host -e PGCONNECT_TIMEOUT=10 postgres:17-alpine \
      psql "$DATABASE_URL" --set ON_ERROR_STOP=1 -tAc \
      "SELECT CASE WHEN to_regclass('public.system_probes') IS NULL
                   THEN 'not applied' ELSE 'applied' END;"
    ;;
  *)
    echo "usage: scripts/migrate-diagnostic.sh up|down|status" >&2
    exit 2
    ;;
esac
