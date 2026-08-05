#!/usr/bin/env bash
# E00-T03 · verifyCompose() — the runtime smoke gate (EARS-E00-6/7/8).
#
# Validating a Compose file proves only that it parses. This builds the images,
# starts the stack, waits for every container to report HEALTHY, checks that the
# API actually answers, and greps the logs for secret fixtures. A stack that
# parses but never becomes healthy is the failure this exists to catch.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DEV_COMPOSE="infra/compose/compose.development.yaml"
PROD_COMPOSE="infra/compose/compose.production.yaml"

failures=0
fail() { echo "verify-compose: FAIL — $1" >&2; failures=$((failures + 1)); }
ok() { echo "verify-compose: ok — $1"; }

# ── 1. both definitions parse ────────────────────────────────────────────────
docker compose -f "$DEV_COMPOSE" config --quiet
ok "development Compose is valid"

APP_ENV=production DATABASE_URL=postgres://placeholder \
  GARAZO_API_IMAGE=placeholder GARAZO_WORKER_IMAGE=placeholder GARAZO_ADMIN_IMAGE=placeholder \
  docker compose -f "$PROD_COMPOSE" config --quiet
ok "production Compose is valid"

# ── 2. production carries no datastore ───────────────────────────────────────
# Checked here as well as in the test suite: this is the single most damaging
# mistake this topology can make, and CI runs this script even when the unit
# tests are skipped.
prod_services=$(APP_ENV=production DATABASE_URL=postgres://placeholder \
  GARAZO_API_IMAGE=placeholder GARAZO_WORKER_IMAGE=placeholder GARAZO_ADMIN_IMAGE=placeholder \
  docker compose -f "$PROD_COMPOSE" config --services | sort | tr '\n' ' ')
if [[ "$prod_services" != "admin api worker " ]]; then
  fail "production services must be exactly 'admin api worker', found: $prod_services"
else
  ok "production runs exactly admin, api and worker"
fi

# ── 3. the development stack actually comes up healthy ───────────────────────
cleanup() {
  echo "verify-compose: tearing down"
  docker compose -f "$DEV_COMPOSE" down --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "verify-compose: building and starting the development stack (this takes a few minutes)"
if ! docker compose -f "$DEV_COMPOSE" up --build --detach --wait --wait-timeout 420; then
  fail "the development stack did not become healthy"
  docker compose -f "$DEV_COMPOSE" ps || true
  docker compose -f "$DEV_COMPOSE" logs --tail 60 || true
  exit 1
fi
ok "every service reported healthy"

# ── 4. the API really answers ────────────────────────────────────────────────
if curl -fsS http://127.0.0.1:3000/api/v1/system/live | grep -q '"status":"ok"'; then
  ok "API liveness responds"
else
  fail "API liveness did not respond with status ok"
fi

# Readiness must be DISTINCT from liveness: it is allowed to be down here
# because T04 has not bound the database check yet. What matters is that it
# answers in the standard envelope rather than crashing.
ready_body=$(curl -sS http://127.0.0.1:3000/api/v1/system/ready || true)
if grep -q '"status":"ready"' <<<"$ready_body" || grep -q '"code":"SYSTEM.NOT_READY"' <<<"$ready_body"; then
  ok "API readiness answers in the contract shape"
else
  fail "API readiness returned an unexpected body"
fi

# ── 5. containers run unprivileged ───────────────────────────────────────────
for service in api worker admin; do
  container=$(docker compose -f "$DEV_COMPOSE" ps -q "$service")
  user=$(docker inspect --format '{{.Config.User}}' "$container")
  if [[ "$user" == "root" || -z "$user" ]]; then
    fail "$service runs as root"
  else
    ok "$service runs as '$user'"
  fi
done

# ── 6. no secret fixture reached the logs ────────────────────────────────────
logs=$(docker compose -f "$DEV_COMPOSE" logs --no-color 2>&1 || true)
for fixture in 'garazo-local-dev' 'BEGIN RSA PRIVATE KEY' 'sk_live_'; do
  if grep -qF "$fixture" <<<"$logs"; then
    fail "a secret fixture appeared in container logs: $fixture"
  fi
done
ok "container logs contain no known secret fixture"

# ── 7. stopping preserves the named volume ───────────────────────────────────
docker compose -f "$DEV_COMPOSE" down --remove-orphans >/dev/null 2>&1 || true
if docker volume ls --format '{{.Name}}' | grep -q 'garazo-dev_garazo-postgres-data'; then
  ok "the development database volume survived shutdown"
else
  fail "the development database volume was removed by shutdown"
fi

if (( failures > 0 )); then
  echo "verify-compose: $failures failure(s)" >&2
  exit 1
fi

echo "verify-compose: all runtime checks passed"
