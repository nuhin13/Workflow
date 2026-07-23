# Token Architecture Roadmap

Status: Proposed - not implemented

Created: 2026-07-23

Purpose: Reduce harness context, cost, and local-model failure rates without
weakening specification, review, QA, traceability, or human approval gates.

## Resume Here

On the next session:

1. Read this file before changing token-related behavior.
2. Run `git status --short`.
3. Run:

   ```bash
   PYTHONDONTWRITEBYTECODE=1 make validate
   PYTHONDONTWRITEBYTECODE=1 python3 -W error::ResourceWarning \
     -m unittest discover -s harness/orchestrator/tests -v
   ```

4. Implement Phase 0 only: complete metrics coverage and establish real
   baselines.
5. Review the measured results before shrinking instructions or changing
   profile artifact contracts.

Do not treat any design below as implemented until its phase is complete,
tested, documented, and marked done here.

## Current Baseline

Measured on 2026-07-23:

| File | Words | Bytes | Loading behavior |
|---|---:|---:|---|
| `AGENTS.md` | 1,323 | 9,990 | Always loaded by AGENTS-compatible tools |
| `CLAUDE.md` | 324 | 2,597 | Claude project adapter; imports `AGENTS.md` |
| `harness/templates/epic/task.template.md` | 1,219 | 8,506 | Every generated task starts from this |

Additional observations:

- Harness agents, skills, workflows, and templates contain about 158 KB of
  Markdown. This is acceptable only while bodies remain on demand.
- `make metrics` currently reports no real run rows in this clean template.
- Pipeline-role runs save raw output but do not enter the task/epic metrics
  reports, so future whole-pipeline measurements would be incomplete.
- All profiles currently preserve the full logical contract-producing spine.
  Lighter profiles reduce process depth but do not yet define compact artifact
  contracts.
- Role-level MCP filtering exists, but task- and target-level tool filtering
  does not.

Approximate token counts must not be used as enforcement because tokenizers
differ. Enforce deterministic byte budgets and record provider-reported token
usage after each run.

## Design Decision

Use one small universal instruction kernel plus a generated context pack for
each run.

Do not create and swap large files such as `AGENTS-small.md`,
`AGENTS-enterprise.md`, or platform-specific copies of the constitution. Every
conditional branch in an always-loaded file still consumes context, and
swapping root instructions weakens reproducibility and caching.

Target flow:

```text
AGENTS.md (small, stable kernel)
        |
        v
context_pack.py
        |
        +-- resolved profile and artifact contract
        +-- task execution contract
        +-- exact SRS/EARS excerpts referenced by the task
        +-- role write restrictions
        +-- relevant ADR/lesson excerpts
        +-- allowed tools and MCP servers
        +-- verification commands and budgets
        |
        v
workspace/runs/<run-id>/<timestamp>-context.md
        |
        v
platform adapter -> selected execution target
```

## Universal Instruction Kernel

### AGENTS.md target

Target: at most 700 words and 6,000 bytes.

Keep only:

- Repository identity and instruction precedence.
- Spec/task authority and stop-on-gap behavior.
- Scope and write-boundary rules.
- Mandatory tests, peer review, QA, and human gates.
- State and traceability requirements.
- The command for obtaining the current context pack.
- Links to detailed policies.

Move out:

- Full phase diagrams.
- Complete ID catalogs and examples.
- Profile explanations.
- Role-specific behavior.
- Long branch and status explanations.
- Project convention placeholders.
- Detailed lookup tables.

### Platform adapters

Target: each platform instruction file at most 150 words and 1,200 bytes.

- `CLAUDE.md` should import `AGENTS.md`, identify native skill/agent locations,
  and name the tracked adapter command.
- OpenCode, Qwen Code, Codex, and future platform config should contain
  platform mechanics only.
- Policy must not be copied into platform adapters.

### Skills and role cards

- Keep skill names and descriptions short because discovery metadata may be
  visible before the body is loaded.
- Load one pipeline driver and only the capability skills needed by the task.
- Keep examples and long checklists under each skill's `references/`.
- Role cards define maximum permissions, not context that every role receives.

## Context Compiler

Planned files:

```text
harness/orchestrator/context_pack.py
harness/orchestrator/tests/test_context_pack.py
harness/context/README.md
harness/context/schema.yaml
```

Proposed command:

```bash
python3 harness/orchestrator/context_pack.py \
  --task E03-T07 \
  --target local-cheap \
  --out workspace/runs/E03-T07/context.md
```

The compiler must:

1. Read paths from `harness.yaml`.
2. Resolve the active profile and execution target.
3. Require a valid task, owner, tier, traces, and file contract.
4. Extract only SRS/EARS entries listed in `traces_to`.
5. Include only ADRs explicitly referenced by the task or matching its files.
6. Include lessons selected by structured area/file tags.
7. Resolve effective tools as the intersection of role, task, and target
   allowlists.
8. Include exact verification commands.
9. Fail when the deterministic context byte budget is exceeded.
10. Save a manifest containing source paths, hashes, byte counts, and policy
    decisions beside the context pack.

The compiler must not:

- Copy the complete SRS or traceability matrix.
- Read every lesson.
- Include historical run transcripts.
- Include a full skill when one reference section is enough.
- Silently truncate mandatory requirements.
- Fall back to another model, tier, profile, or tool set.

## Artifact Contracts

Profiles should select physical artifact depth while preserving logical safety
gates.

```yaml
artifact_contracts:
  compact:
    context_budget_bytes: 24000
    max_agent_steps: 8
    max_mcp_tools: 1

  standard:
    context_budget_bytes: 48000
    max_agent_steps: 16
    max_mcp_tools: 3

  audited:
    context_budget_bytes: 96000
    max_agent_steps: 30
    max_mcp_tools: 6
```

### Compact

Use for small projects and low-risk internal tools.

Required artifacts remain:

- Approved BRD.
- Approved UI reference.
- Approved canonical `workspace/spec/srs.md`.
- Compact trace table.
- Accepted foundational ADRs when choices are required.
- Epic/task queue with EARS acceptance criteria.
- Peer review and epic QA evidence.

The SRS may contain compact product, requirement, acceptance, and technical
summary sections. Do not generate separate forecast, feature, or long planning
documents unless the project needs them.

### Standard

Use separate SRS, traceability, technical plan, ADRs, and dev plan, but keep
business supporting artifacts concise.

### Audited

Keep the current full artifact family, evidence trail, and deeper independent
review expected for regulated or multi-team projects.

Changing artifact contracts requires validator support. A compact profile must
never bypass SRS approval or enter build without a canonical task contract.

## Execution Targets

Separate the CLI platform from the model provider and model tier.

Proposed shape:

```yaml
execution_targets:
  local-cheap:
    platform: opencode
    provider: ollama
    model: qwen-coder-local
    allowed_tiers: [cheap]
    context_budget_bytes: 20000
    max_steps: 6
    mcp: []

  local-build:
    platform: qwen-code
    provider: vllm
    model: stronger-local-coder
    allowed_tiers: [cheap, build]
    context_budget_bytes: 40000
    max_steps: 12
    mcp: []

  remote-deep:
    platform: codex
    provider: openai
    allowed_tiers: [cheap, build, deep]
```

Model IDs are deliberately placeholders. Select them only after checking local
hardware, runtime compatibility, tool calling, license, and repository-specific
evaluation results.

OpenCode and Qwen Code can use OpenAI-compatible local endpoints. Candidate
runtimes include Ollama, LM Studio, llama.cpp, MLX, and vLLM.

References:

- Codex AGENTS guidance:
  https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Claude project memory:
  https://docs.anthropic.com/en/docs/claude-code/memory
- OpenCode skills:
  https://opencode.ai/docs/skills
- OpenCode custom providers:
  https://opencode.ai/docs/providers
- Qwen Code model providers:
  https://qwenlm.github.io/qwen-code-docs/en/users/configuration/model-providers/
- Qwen Agent:
  https://github.com/QwenLM/Qwen-Agent
- Gemma local runtimes:
  https://ai.google.dev/gemma/docs/run

## Local-Model Policy

Small local models around 7B/8B are `cheap` by default.

Allowed before repository evaluation:

- Mechanical edits and renames.
- Documentation updates.
- Focused test scaffolding.
- Lint and type-error fixes with exact diagnostics.
- Small functions with complete contracts.
- Summaries used by the context compiler.

Not allowed before repository evaluation:

- Architecture and foundational ADR decisions.
- Authentication, payment, migration, or production configuration work.
- Cross-module refactors.
- Security review.
- Canonical SRS approval.
- Final independent QA.

Local execution guardrails:

- One task at a time.
- Prefer one or two owned files.
- No subagent nesting.
- No MCP by default.
- Expose only deterministic read, search, patch, and test tools.
- Limit tool calls and output size.
- Validate patches outside the model.
- Review with a different, stronger model.
- Fail closed when tool calling or structured output is malformed.

## Measurement Plan

Phase 0 must measure all task and pipeline-role runs.

Record:

- Run ID, task/role, profile, target, platform, provider, and model.
- Context-pack bytes and source-manifest bytes.
- Provider-reported input, cached input, and output tokens.
- Tool calls, MCP servers, duration, exit code, and retry count.
- Files and bytes read when the platform exposes this information.
- Actual or estimated cost.

Add warnings for:

- Context pack over target budget.
- Missing provider usage.
- Low cache-read ratio on repeated stable prefixes.
- Excessive tool calls.
- A cheap/local target used for a prohibited risk category.

Pipeline-role metrics must appear in `make metrics` and the dashboard. Raw run
files are not sufficient.

## Evaluation Gate

Create at least 20 representative repository tasks:

- 5 mechanical.
- 5 focused bug fixes.
- 4 test-writing tasks.
- 3 small features.
- 3 adversarial scope/spec-gap tasks.

For each target, measure:

- Patch applies cleanly.
- Required tests pass.
- Scope violations.
- Invented APIs or files.
- Missed acceptance criteria.
- Tool-call failures.
- Reviewer findings.
- Input/output tokens and elapsed time.

A local target may enter `build` only after it passes the agreed threshold and
has no high-risk scope violations. It must still remain excluded from `deep`
and final QA until separately approved.

## Implementation Phases

### Phase 0 - Metrics baseline

- [ ] Record pipeline-role usage.
- [ ] Record context bytes and target metadata.
- [ ] Add token/context warnings.
- [ ] Run representative current-harness tasks.
- [ ] Publish baseline totals.

### Phase 1 - Universal kernel

- [ ] Reduce `AGENTS.md` to the byte/word target.
- [ ] Reduce `CLAUDE.md` to a thin adapter.
- [ ] Move detail into on-demand policy files.
- [ ] Verify every constitution rule still has one authoritative home.
- [ ] Re-run cross-platform instruction discovery checks.

### Phase 2 - Context compiler

- [ ] Define context manifest schema.
- [ ] Implement exact trace/ADR/lesson extraction.
- [ ] Add deterministic byte budgets.
- [ ] Integrate with every adapter.
- [ ] Add fail-closed tests.

### Phase 3 - Artifact contracts

- [ ] Define compact, standard, and audited requirements.
- [ ] Add compact templates and skills.
- [ ] Update profile validation.
- [ ] Prove every profile reaches build with an approved canonical spec.
- [ ] Prove compact mode does not skip mandatory gates.

### Phase 4 - Local execution

- [ ] Add provider-aware execution targets.
- [ ] Add local OpenAI-compatible configuration.
- [ ] Add task/target tool intersections.
- [ ] Add step and tool-call limits.
- [ ] Run the evaluation suite.

### Phase 5 - Rollout

- [ ] Compare median input tokens and cost against Phase 0.
- [ ] Review failures and quality regressions.
- [ ] Enable local `cheap` routing.
- [ ] Enable local `build` only if evaluation passes.
- [ ] Update operator documentation.

## Acceptance Criteria

The roadmap is complete only when:

- `AGENTS.md` is at most 700 words and 6,000 bytes.
- Each platform adapter instruction file is at most 150 words and 1,200 bytes.
- Every dispatched run has a context manifest and budget decision.
- All task and pipeline-role runs appear in metrics.
- Compact, standard, and audited profiles are validator-enforced and
  executable.
- Local models cannot receive prohibited risk categories.
- Local models cannot silently fall back or self-approve.
- Existing P1/P2/P3 review fixes remain covered by tests.
- `make validate` passes with zero warnings.
- The full orchestrator test suite passes.
- Median input tokens fall materially without lowering task success or review
  quality.

## Open Decisions

Decide after Phase 0 measurements:

- Exact byte budgets per artifact contract.
- Whether global run metrics replace or supplement epic `metrics.csv`.
- Whether `context_pack.py` embeds content in the prompt or provides a file.
- Which local runtime is supported first.
- Local hardware and quantization constraints.
- Evaluation pass thresholds.
- Which stronger model performs independent review for local-model work.

