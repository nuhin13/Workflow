#!/usr/bin/env bash
# E00-T02 · checkApiContract() — the CI compatibility and drift gate.
#
# Exits 0 only when the canonical contract validates AND regenerating both
# clients produces byte-identical output to what is committed. A drifted client
# means someone hand-edited generated code or changed the contract without
# regenerating; both silently break the other side of the wire.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CONTRACT="contracts/openapi/garazo.v1.yaml"

echo "api-contract: validating $CONTRACT"
pnpm exec openapi-generator-cli validate -i "$CONTRACT"

# Snapshot the committed trees, regenerate, and compare. Working in a temp copy
# keeps a failed check from leaving the repository half-regenerated.
SNAPSHOT="$(mktemp -d)"
trap 'rm -rf "$SNAPSHOT"' EXIT

TS_OUT="packages/api-client-typescript/src/generated"
DART_OUT="apps/mobile/lib/core/api/generated"

for tree in "$TS_OUT" "$DART_OUT"; do
  if [[ -d "$tree" ]]; then
    mkdir -p "$SNAPSHOT/$tree"
    cp -R "$tree/." "$SNAPSHOT/$tree/"
  fi
done

bash scripts/generate-api-clients.sh >/dev/null

drift=0
for tree in "$TS_OUT" "$DART_OUT"; do
  if ! diff -r -q "$SNAPSHOT/$tree" "$tree" >/dev/null 2>&1; then
    echo "api-contract: generated client drift in $tree" >&2
    diff -r -q "$SNAPSHOT/$tree" "$tree" >&2 || true
    drift=1
  fi
done

if (( drift != 0 )); then
  echo "api-contract: run \`pnpm generate:api\` and commit the regenerated clients." >&2
  exit 1
fi

echo "api-contract: contract valid and both generated clients are clean"
