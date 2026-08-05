#!/usr/bin/env bash
# E00-T01 · checkToolchain() — makes the clean-clone toolchain contract
# executable (EARS-E00-1).
#
# Exits 0 only when the local Node, pnpm, Flutter and Dart match the versions
# this repository pins. Anything else is a hard failure: a scaffold that builds
# on one machine and not another is not a scaffold.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

failures=0

fail() {
  printf 'toolchain: %s\n' "$1" >&2
  failures=$((failures + 1))
}

ok() {
  printf 'toolchain: %s\n' "$1"
}

require_file() {
  if [[ ! -f "$1" ]]; then
    fail "missing version pin file $1"
    return 1
  fi
}

# ── Node ────────────────────────────────────────────────────────────────────
if require_file .node-version; then
  expected_node="$(tr -d '[:space:]' < .node-version)"
  if ! command -v node >/dev/null 2>&1; then
    fail "node is not installed (expected $expected_node)"
  else
    actual_node="$(node --version | sed 's/^v//')"
    if [[ "$actual_node" == "$expected_node" ]]; then
      ok "node $actual_node"
    else
      fail "node $actual_node does not match the pinned $expected_node"
    fi
  fi
fi

# ── pnpm ────────────────────────────────────────────────────────────────────
# The pin lives in package.json's packageManager field, which corepack reads.
expected_pnpm="$(node -p "require('./package.json').packageManager.split('@')[1]" 2>/dev/null || echo '')"
if [[ -z "$expected_pnpm" ]]; then
  fail "package.json has no packageManager pin for pnpm"
elif ! command -v pnpm >/dev/null 2>&1; then
  fail "pnpm is not available (run: corepack enable pnpm) — expected $expected_pnpm"
else
  actual_pnpm="$(pnpm --version)"
  if [[ "$actual_pnpm" == "$expected_pnpm" ]]; then
    ok "pnpm $actual_pnpm"
  else
    fail "pnpm $actual_pnpm does not match the pinned $expected_pnpm"
  fi
fi

# ── Flutter ─────────────────────────────────────────────────────────────────
if require_file .flutter-version; then
  expected_flutter="$(tr -d '[:space:]' < .flutter-version)"
  if ! command -v flutter >/dev/null 2>&1; then
    fail "flutter is not installed (expected $expected_flutter)"
  else
    actual_flutter="$(flutter --version | sed -n '1s/^Flutter \([^ ]*\).*/\1/p')"
    if [[ "$actual_flutter" == "$expected_flutter" ]]; then
      ok "flutter $actual_flutter"
    else
      fail "flutter $actual_flutter does not match the pinned $expected_flutter"
    fi
  fi
fi

# ── Dart ────────────────────────────────────────────────────────────────────
# Dart is pinned indirectly: apps/mobile/pubspec.yaml declares the SDK range the
# Flutter toolchain must satisfy.
expected_dart_range="$(sed -n 's/^  sdk: \^\(.*\)$/\1/p' apps/mobile/pubspec.yaml | head -1)"
if [[ -z "$expected_dart_range" ]]; then
  fail "apps/mobile/pubspec.yaml declares no Dart SDK constraint"
elif ! command -v dart >/dev/null 2>&1; then
  fail "dart is not installed (expected ^$expected_dart_range)"
else
  actual_dart="$(dart --version 2>&1 | sed -n 's/.*Dart SDK version: \([^ ]*\).*/\1/p')"
  expected_major="${expected_dart_range%%.*}"
  actual_major="${actual_dart%%.*}"
  if [[ "$actual_major" == "$expected_major" ]]; then
    ok "dart $actual_dart (satisfies ^$expected_dart_range)"
  else
    fail "dart $actual_dart does not satisfy ^$expected_dart_range"
  fi
fi

if (( failures > 0 )); then
  printf 'toolchain: %d check(s) failed\n' "$failures" >&2
  exit 1
fi

printf 'toolchain: all pinned versions match\n'
