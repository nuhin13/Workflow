#!/usr/bin/env bash
# E00-T05 · verifyCleanClone() — the single E00 quality gate (EARS-E00-12).
#
# Runs the whole chain in order: pinned toolchain, install, generated-artifact
# drift, lint, format, build, every test suite, secret scan, container images,
# Compose health, and the real UI-to-PostgreSQL round trip.
#
# Ordering is deliberate — cheapest and most-likely-to-fail first, so a broken
# toolchain reports in seconds rather than after a six-minute image build.
#
# Exits 0 only when every step passes. Nothing here contacts a provider, and
# nothing touches production.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

STEP=0
FAILED=()

run_step() {
  local label="$1"; shift
  STEP=$((STEP + 1))
  printf '\n=== [%02d] %s ===\n' "$STEP" "$label"

  if "$@"; then
    printf '--- [%02d] PASS: %s\n' "$STEP" "$label"
  else
    printf -- '--- [%02d] FAIL: %s\n' "$STEP" "$label" >&2
    FAILED+=("$label")
  fi
}

# Every step runs even after a failure. Stopping at the first one turns a full
# picture into a slow game of whack-a-mole across repeated six-minute runs.
run_step "pinned toolchain matches"       bash scripts/check-toolchain.sh
run_step "install (frozen lockfile)"      pnpm install --frozen-lockfile
run_step "flutter dependencies"           bash -c 'cd apps/mobile && flutter pub get'
run_step "design tokens: zero drift"      pnpm check:tokens
run_step "OpenAPI contract + client drift" pnpm check:api
run_step "eslint"                         pnpm lint
run_step "flutter analyze"                bash -c 'cd apps/mobile && flutter analyze'
run_step "formatting"                     pnpm format
run_step "build all entry points"         pnpm --recursive --if-present run build
run_step "secret scan"                    bash scripts/scan-secrets.sh
run_step "node test suites"               pnpm test
run_step "flutter test suites"            bash -c 'cd apps/mobile && flutter test'
run_step "container images + compose smoke" bash scripts/verify-compose.sh
run_step "walking skeleton round trip"    bash -c 'node --test "tests/integration/**/*.spec.ts" "tests/e2e/**/*.spec.ts"'

printf '\n===============================================\n'
if (( ${#FAILED[@]} > 0 )); then
  printf 'verify-clean-clone: %d of %d steps FAILED\n' "${#FAILED[@]}" "$STEP" >&2
  for label in "${FAILED[@]}"; do
    printf '  - %s\n' "$label" >&2
  done
  exit 1
fi

printf 'verify-clean-clone: all %d steps passed\n' "$STEP"
