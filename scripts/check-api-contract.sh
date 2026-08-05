#!/usr/bin/env bash
# E00-T02/T03 · checkApiContract() — the CI compatibility and drift gate.
#
# Exits 0 only when the canonical contract validates AND regenerating both
# clients reproduces exactly what is committed. A drifted client means someone
# hand-edited generated code or changed the contract without regenerating; both
# silently break the other side of the wire.
#
# This check is NON-DESTRUCTIVE: it regenerates into a temporary directory and
# compares. An earlier version wiped and rebuilt the real trees in place, which
# raced against any concurrent `flutter analyze` reading those same files — the
# test runner executes files in parallel, so it failed intermittently and for a
# reason unrelated to the change under test. A gate must not mutate the thing it
# is inspecting.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CONTRACT="contracts/openapi/garazo.v1.yaml"

echo "api-contract: validating $CONTRACT"
pnpm exec openapi-generator-cli validate -i "$CONTRACT"

SCRATCH="$(mktemp -d)"
trap 'rm -rf "$SCRATCH"' EXIT

TS_OUT="packages/api-client-typescript/src/generated"
DART_OUT="apps/mobile/lib/core/api/generated"

# Regenerate each client into the scratch tree. -o overrides the config's
# outputDir so the committed trees are never touched.
regenerate() {
  local config="$1" destination="$2"
  mkdir -p "$destination"
  pnpm exec openapi-generator-cli generate -c "$config" -o "$destination" >/dev/null
  # Same strip as the generate script: these are the generator's
  # standalone-package files, not contract output.
  rm -f "$destination/.openapi-generator-ignore"
  rm -rf "$destination/.openapi-generator"
  rm -f "$destination/.gitignore" "$destination/.npmignore" "$destination/.travis.yml"
  rm -f "$destination/git_push.sh" "$destination/README.md" "$destination/pubspec.yaml"
  rm -f "$destination/package.json" "$destination/tsconfig.json" "$destination/tsconfig.esm.json"
  rm -f "$destination/analysis_options.yaml"
}

regenerate contracts/openapi/generator/typescript.yaml "$SCRATCH/typescript"
regenerate contracts/openapi/generator/dart.yaml "$SCRATCH/dart"

drift=0
compare() {
  local expected="$1" committed="$2" label="$3"
  if ! diff -r -q "$expected" "$committed" >/dev/null 2>&1; then
    echo "api-contract: generated client drift in $committed ($label)" >&2
    diff -r -q "$expected" "$committed" >&2 || true
    drift=1
  fi
}

compare "$SCRATCH/typescript" "$TS_OUT" TypeScript
compare "$SCRATCH/dart" "$DART_OUT" Dart

if (( drift != 0 )); then
  echo "api-contract: run \`pnpm generate:api\` and commit the regenerated clients." >&2
  exit 1
fi

echo "api-contract: contract valid and both generated clients are clean"
