# Agentic harness — tracker targets.
# Stack ops (up/down/migrate/test/lint) are added by the genesis epic (E00)
# once the stack is decided.
PY := python3
SCHED := $(PY) harness/orchestrator/scheduler.py
LAYER ?=
PLATFORM ?=

.PHONY: next status review validate dashboard metrics metrics-json hooks help

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
