#!/usr/bin/env bash
# E00-T03 · secret scan over tracked files.
#
# A committed credential is not fixed by deleting it later — it stays in history
# and must be rotated. Cheap detection at commit and CI time is worth far more
# than a thorough scan that runs after the fact.
#
# Exits non-zero on the first credible finding.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

findings=0

report() {
  echo "secret-scan: $1" >&2
  findings=$((findings + 1))
}

# Patterns for credentials that are real if present. Local placeholders are
# excluded by path below, so a hit here is a genuine problem.
PATTERNS=(
  'AKIA[0-9A-Z]{16}'                        # AWS access key id
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'      # private key material
  'sk_live_[0-9a-zA-Z]{16,}'                # live payment secret key
  'AIza[0-9A-Za-z_-]{35}'                   # Google/Firebase API key
  'ghp_[0-9a-zA-Z]{36}'                     # GitHub personal access token
  'xox[baprs]-[0-9a-zA-Z-]{10,}'            # Slack token
  'eyJhbGciOi[0-9a-zA-Z_-]{20,}'            # JWT
)

# Files that legitimately contain placeholder credentials or describe the
# patterns themselves. Excluding them keeps the signal usable; a scanner that
# cries wolf gets switched off.
EXCLUDES=(
  ':(exclude).env.example'
  ':(exclude)scripts/scan-secrets.sh'
  ':(exclude)infra/compose/compose.development.yaml'
  ':(exclude)docs/operations/*'
  ':(exclude)harness/*'
  ':(exclude)workspace/*'
  ':(exclude)pnpm-lock.yaml'
  ':(exclude)*/generated/*'
)

for pattern in "${PATTERNS[@]}"; do
  if matches=$(git grep -nIE "$pattern" -- . "${EXCLUDES[@]}" 2>/dev/null); then
    report "possible credential matching /$pattern/:"
    echo "$matches" >&2
  fi
done

# A real .env must never be tracked; .env.example is the only permitted one.
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  report ".env is tracked by git — it must never be committed"
fi

for tracked in $(git ls-files '*.pem' '*.key' '*.jks' '*.keystore' 'google-services.json' 2>/dev/null); do
  report "credential file is tracked: $tracked"
done

if (( findings > 0 )); then
  echo "secret-scan: $findings finding(s)" >&2
  exit 1
fi

echo "secret-scan: no credential patterns found in tracked files"
