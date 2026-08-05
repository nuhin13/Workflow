#!/usr/bin/env bash
# E00-T03 · start the LOCAL development stack.
#
# Development only. This script never targets production: production is deployed
# by the runbook in infra/vm/deploy-runbook.md, deliberately not by a convenience
# script that could be run against the wrong host by muscle memory.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT/infra/compose/compose.development.yaml"

echo "compose-up: building and starting the development stack"
docker compose -f "$COMPOSE_FILE" up --build --detach --wait --wait-timeout 300

echo "compose-up: services"
docker compose -f "$COMPOSE_FILE" ps
