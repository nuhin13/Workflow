#!/usr/bin/env bash
# E00-T05 · rehearseVmRebuild() — prove the single VM is rebuildable.
#
# ADR-0006 accepts one VM as a shared failure domain, but ONLY because nothing
# authoritative lives on it. This rehearses that claim: it checks that every
# input needed to rebuild exists in source or in declared off-host material, and
# that no step depends on host-local state.
#
# It PROVISIONS NOTHING and MUTATES NOTHING. A rehearsal that could damage an
# environment would never be run, and an unrehearsed runbook is a hypothesis.
#
# Usage: scripts/rehearse-vm-rebuild.sh dry-run|non-production
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="${1:-dry-run}"

case "$MODE" in
  dry-run|non-production) ;;
  production)
    echo "rehearse: refusing to rehearse against production" >&2
    exit 2
    ;;
  *)
    echo "usage: scripts/rehearse-vm-rebuild.sh dry-run|non-production" >&2
    exit 2
    ;;
esac

findings=0
blocked=0

ok()      { printf '  ok       %s\n' "$1"; }
fail()    { printf '  MISSING  %s\n' "$1" >&2; findings=$((findings + 1)); }
blocked() { printf '  BLOCKED  %s\n' "$1"; blocked=$((blocked + 1)); }

require_file() {
  if [[ -f "$1" ]]; then ok "$2"; else fail "$2 ($1)"; fi
}

echo "rehearse-vm-rebuild: mode=$MODE (nothing is provisioned or modified)"

echo
echo "1. Rebuild inputs that must exist in SOURCE"
require_file infra/compose/compose.production.yaml "production topology"
require_file apps/api/Dockerfile                   "API image definition"
require_file apps/worker/Dockerfile                "worker image definition"
require_file apps/admin/Dockerfile                 "admin image definition"
require_file .env.example                          "configuration key inventory"
require_file infra/vm/hardening-checklist.md       "host hardening steps"
require_file infra/vm/deploy-runbook.md            "deploy procedure"
require_file infra/vm/rebuild-runbook.md           "rebuild procedure"
require_file infra/vm/rollback-runbook.md          "rollback procedure"
require_file infra/db/README.md                    "migration procedure"

echo
echo "2. Nothing authoritative may live only on the VM"
# The production topology declaring a volume, or a data service, would mean the
# only copy of a workshop's records sits on a host we accept losing.
if grep -qE '^volumes:' infra/compose/compose.production.yaml; then
  fail "production topology declares a volume — data would live on the VM"
else
  ok "production topology declares no volume"
fi

if grep -qiE 'image:.*(postgres|minio|redis|mongo)' infra/compose/compose.production.yaml; then
  fail "production topology runs a data service on the application VM"
else
  ok "database and object storage remain external"
fi

# DATABASE_URL must be required from the environment, never defaulted, or a
# rebuilt VM could silently start against the wrong datastore.
if grep -q 'DATABASE_URL: ${DATABASE_URL:?}' infra/compose/compose.production.yaml; then
  ok "DATABASE_URL is required from the environment, not defaulted"
else
  fail "DATABASE_URL is defaulted or absent in the production topology"
fi

echo
echo "3. Off-host material the rebuild depends on"
# These are decisions, not files. Naming them here is the point: a rebuild that
# assumes them silently fails on the day it is needed.
blocked "container registry holding the exact running images (open item 4)"
blocked "secret manager holding DATABASE_URL and provider credentials (open item 6)"
blocked "verified backups of the managed database (open items 7, 8)"
blocked "off-host log destination for post-mortem (open item 10)"
require_file infra/vm/recovery-open-items.md "unresolved-decision register"

echo
echo "4. Runbook honesty"
# A runbook that reads as complete but silently assumes an unmade decision is
# worse than one that says BLOCKED, because it fails at the worst moment.
for runbook in deploy-runbook rebuild-runbook rollback-runbook; do
  if grep -q 'BLOCKED' "infra/vm/${runbook}.md"; then
    ok "${runbook} marks its unresolved steps"
  else
    fail "${runbook} claims to be fully executable"
  fi
done

echo
echo "5. Rebuild is reproducible from source alone"
# The rebuild must not need anything a person remembers.
if git -C "$ROOT" ls-files --error-unmatch infra/compose/compose.production.yaml >/dev/null 2>&1; then
  ok "production topology is version controlled"
else
  fail "production topology is not tracked by git"
fi

echo
echo "==============================================="
printf 'rehearse-vm-rebuild: %d missing input(s), %d step(s) blocked on an open decision\n' \
  "$findings" "$blocked"

if (( findings > 0 )); then
  echo "rehearse-vm-rebuild: FAILED — the VM is not rebuildable from source as declared" >&2
  exit 1
fi

echo "rehearse-vm-rebuild: every source input is present."
echo "rehearse-vm-rebuild: the $blocked blocked step(s) are UNRESOLVED HUMAN DECISIONS,"
echo "                     recorded in infra/vm/recovery-open-items.md. Until they are"
echo "                     answered, a real rebuild CANNOT be completed — this rehearsal"
echo "                     proves the source side only."
