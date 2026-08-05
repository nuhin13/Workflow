#!/usr/bin/env bash
# E00-T02 · generateApiClients() — regenerates both API clients from the
# canonical contract (ADR-0008).
#
# The generated trees are DERIVED. Never hand-edit them; change
# contracts/openapi/garazo.v1.yaml and re-run this.
#
# Exits 0 only when both generations succeed.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CONTRACT="contracts/openapi/garazo.v1.yaml"
TS_OUT="packages/api-client-typescript/src/generated"
DART_OUT="apps/mobile/lib/core/api/generated"

if [[ ! -f "$CONTRACT" ]]; then
  echo "api-clients: missing canonical contract $CONTRACT" >&2
  exit 1
fi

generate() {
  local config="$1" out="$2" label="$3"
  # Wipe first: a stale file from a removed schema would otherwise survive
  # regeneration and the drift check would never notice it.
  rm -rf "$out"
  mkdir -p "$out"
  pnpm exec openapi-generator-cli generate -c "$config" >/dev/null
  # Strip everything that is not client source. The generator assumes it is
  # producing a standalone published package, so it emits its own manifest,
  # toolchain config, CI file and .gitignore. Inside our workspace those are
  # actively harmful: the .gitignore files would exclude the generated client
  # from version control, and a nested manifest is a second, drifting copy of
  # toolchain config we already own.
  rm -f "$out/.openapi-generator-ignore"
  rm -rf "$out/.openapi-generator"
  rm -f "$out/.gitignore" "$out/.npmignore" "$out/.travis.yml" "$out/git_push.sh"
  rm -f "$out/README.md" "$out/pubspec.yaml" "$out/package.json"
  rm -f "$out/tsconfig.json" "$out/tsconfig.esm.json" "$out/analysis_options.yaml"
  echo "api-clients: generated $label -> $out"
}

generate contracts/openapi/generator/typescript.yaml "$TS_OUT" "TypeScript"
generate contracts/openapi/generator/dart.yaml "$DART_OUT" "Dart"

echo "api-clients: both clients regenerated from $CONTRACT"
