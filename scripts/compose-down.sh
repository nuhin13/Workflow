#!/usr/bin/env bash
# E00-T03 · stop the LOCAL development stack.
#
# Stops containers and REMOVES NOTHING PERSISTENT. There is no `-v` / `--volumes`
# here, and there must never be: a developer stopping the stack must not lose
# local database contents, and a script that sometimes deletes data teaches
# people to fear a routine command. Removing the volume is a deliberate,
# explicit act — see the printed hint.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT/infra/compose/compose.development.yaml"

echo "compose-down: stopping the development stack (named volumes are preserved)"
docker compose -f "$COMPOSE_FILE" down --remove-orphans

echo "compose-down: to discard local database data, run this deliberately:"
echo "  docker volume rm garazo-dev_garazo-postgres-data"
