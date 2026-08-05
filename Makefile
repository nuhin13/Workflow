# Agentic harness — tracker targets.
# Stack ops are added by the genesis epic (E00); E00-T01 adds the build/test
# commands below, and T03 adds the container and CI targets.
PY := python3
SCHED := $(PY) harness/orchestrator/scheduler.py
LAYER ?=
PLATFORM ?=

.PHONY: next status review validate dashboard metrics metrics-json hooks help \
        install toolchain tokens lint format test build dev-api dev-worker dev-admin dev-mobile

# ── Harness / tracker ─────────────────────────────────────────────────────────
next:        ## next executable task(s); make next PLATFORM=codex LAYER=frontend
	$(SCHED) --next $(if $(PLATFORM),--platform $(PLATFORM),) $(if $(LAYER),--layer $(LAYER),)
status:      ## per-epic progress board
	$(SCHED) --status
review:      ## tasks waiting for peer/QA review
	$(SCHED) --review-queue
validate:    ## DAG + frontmatter + constitution sanity
	$(SCHED) --validate
	$(PY) harness/orchestrator/validate_harness.py
dashboard:   ## rebuild workspace/dashboard/index.html
	$(PY) harness/orchestrator/dashboard_build.py
metrics:     ## summarize task/epic token+cost usage from metrics.csv
	$(PY) harness/orchestrator/metrics_report.py
metrics-json: ## emit task/epic token+cost usage as JSON
	$(PY) harness/orchestrator/metrics_report.py --json
hooks:       ## install git hooks (co-author strip, main/development protection)
	bash harness/hooks/install-hooks.sh

help:        ## show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

# ── Product stack (E00-T01) ───────────────────────────────────────────────────
# Every target below is additive; no harness target above was changed.
install:     ## install pinned JS and Dart dependencies
	corepack enable pnpm
	pnpm install
	cd apps/mobile && flutter pub get
toolchain:   ## verify local Node/pnpm/Flutter/Dart match the repository pins
	bash scripts/check-toolchain.sh
tokens:      ## regenerate Dart + TypeScript design tokens, then assert zero drift
	pnpm generate:tokens
	pnpm check:tokens
lint:        ## eslint the TypeScript workspace and analyze the Flutter app
	pnpm lint
	cd apps/mobile && flutter analyze
format:      ## check formatting of product code
	pnpm format
test:        ## run the EARS contract suite and the Flutter widget tests
	pnpm test
	cd apps/mobile && flutter test
build:       ## build every buildable entry point
	pnpm --recursive --if-present run build
dev-api:     ## run the NestJS API composition root
	pnpm --filter @garazo/api run dev
dev-worker:  ## run the NestJS worker composition root
	pnpm --filter @garazo/worker run dev
dev-admin:   ## run the Next.js admin shell
	pnpm --filter @garazo/admin run dev
dev-mobile:  ## run the Flutter owner shell
	cd apps/mobile && flutter run
