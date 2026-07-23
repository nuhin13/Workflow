#!/usr/bin/env python3
"""Harness self-validation — enforce the constitution's machine-checkable rules.

Complements scheduler.py --validate (DAG, statuses, traces_to presence) with:
  - agent cards: frontmatter parses, name+description present, every skill in
    `skills:` exists under harness/skills/
  - skills: every dir has SKILL.md with name+description frontmatter
  - task files: id grammar E<NN>-T<MM>/E<NN>-B<MM>, traces_to id grammar,
    mandatory `files:` mirror (create/update lists), peer rule
    reviewed_by != executed_by once a review is recorded
  - epic files: id grammar E<NN>
  - lessons: every area file promised by the README exists
  - doc rot: repo paths referenced from AGENTS.md / CLAUDE.md / agent cards /
    skills exist on disk

Exit 1 on errors; warnings don't fail the run.
Usage: python3 harness/orchestrator/validate_harness.py [--strict]
"""
import argparse, glob, json, os, re, sys

try:
    import yaml
except ImportError:
    sys.exit("harness: pip install pyyaml (see requirements.txt)")

sys.path.insert(0, os.path.dirname(__file__))
from paths import ROOT, abspath, load_config

TASK_ID = re.compile(r"^E\d{2}-[TB]\d{2}$")
EPIC_ID = re.compile(r"^E\d{2}$")
QUESTION_ID = re.compile(r"^Q-\d{3}$")
TRACE_ID = re.compile(
    r"^(BR-\d{3}|FR-\d{3}|FR-[A-Z0-9]+-\d{1,3}|NFR-[A-Z0-9]+-\d{1,3}|FT-\d{3}"
    r"|SCR-\d{3}|FC-\d{3}|ADR-\d{3,4}|UC-[\d.]+|EARS-[A-Z0-9]+-\d+|Module-\d+)$"
)
# repo-relative path references worth existence-checking. Only STATIC harness
# paths — generated workspace files are pipeline
# OUTPUTS that legitimately don't exist in the pristine template.
PATH_REF = re.compile(
    r"`((?:harness/(?:docs|skills|workflows|agents|memory|adapters|hooks|mcp|orchestrator|templates|rates)"
    r"/[A-Za-z0-9_./-]+)|workspace/(?:state\.yaml|README\.md|docs/README\.md|assets/README\.md"
    r"|docs/business/(?:README\.md|BRD\.md)|docs/design/README\.md|spec/README\.md"
    r"|epics/README\.md|runs/README\.md|dashboard/README\.md|plan/README\.md))`"
)


def frontmatter(path):
    text = open(path, encoding="utf-8").read()
    m = re.match(r"\s*---\s*\n(.*?)\n---\s*\n", text, re.S)
    if not m:
        return None
    try:
        data = yaml.safe_load(m.group(1))
        return data if isinstance(data, dict) else None
    except yaml.YAMLError:
        return None


def check_agents(errs, warns):
    for path in sorted(glob.glob(os.path.join(ROOT, "harness", "agents", "*.md"))):
        if os.path.basename(path) in ("README.md",) or os.path.basename(path).startswith("_"):
            continue
        rel = os.path.relpath(path, ROOT)
        fm = frontmatter(path)
        if fm is None:
            errs.append(f"{rel}: missing or unparseable frontmatter")
            continue
        for field in ("name", "description"):
            if not fm.get(field):
                errs.append(f"{rel}: frontmatter missing '{field}'")
        for skill in fm.get("skills") or []:
            if not os.path.isfile(os.path.join(ROOT, "harness", "skills", str(skill), "SKILL.md")):
                errs.append(f"{rel}: skills: '{skill}' has no harness/skills/{skill}/SKILL.md")


def check_skills(errs, warns):
    for d in sorted(glob.glob(os.path.join(ROOT, "harness", "skills", "*"))):
        if not os.path.isdir(d):
            continue
        rel = os.path.relpath(d, ROOT)
        sk = os.path.join(d, "SKILL.md")
        if not os.path.isfile(sk):
            errs.append(f"{rel}: no SKILL.md")
            continue
        fm = frontmatter(sk)
        if fm is None or not fm.get("name") or not fm.get("description"):
            errs.append(f"{rel}/SKILL.md: frontmatter must define name + description")


def check_pipeline_profiles(errs, warns):
    """Profiles must preserve every prerequisite needed by their later phases."""
    cfg = load_config()
    order = list(cfg.get("phase_order") or [])
    dependencies = cfg.get("phase_dependencies") or {}
    pipeline = cfg.get("pipeline") or {}
    profiles = cfg.get("profiles") or {}
    review_modes = {
        "self-review only",
        "peer_on_code_light_on_docs",
        "peer_on_all_code",
        "peer_on_every_task",
    }
    qa_modes = {"epic_sweep_plus_high_risk"}

    if not order:
        errs.append("harness.yaml: phase_order must define the executable pipeline")
        return
    for phase in order:
        if phase not in pipeline:
            errs.append(f"harness.yaml: phase_order phase '{phase}' has no pipeline drivers")
    if "srs-authoring" not in (pipeline.get("srs") or []):
        errs.append("harness.yaml: pipeline.srs must invoke srs-authoring")

    order_index = {phase: index for index, phase in enumerate(order)}
    for phase, required in dependencies.items():
        if phase not in order_index:
            errs.append(f"harness.yaml: phase_dependencies defines unknown phase '{phase}'")
            continue
        for prerequisite in required or []:
            if prerequisite not in order_index:
                errs.append(f"harness.yaml: phase '{phase}' depends on unknown phase '{prerequisite}'")
            elif order_index[prerequisite] >= order_index[phase]:
                errs.append(f"harness.yaml: phase '{phase}' dependency '{prerequisite}' "
                            "must appear earlier in phase_order")

    for profile, policy in profiles.items():
        if not isinstance(policy, dict):
            errs.append(f"harness.yaml: profile '{profile}' policy must be a mapping")
            continue
        review_mode = policy.get("review")
        qa_mode = policy.get("qa")
        if review_mode not in review_modes:
            errs.append(f"harness.yaml: profile '{profile}' review '{review_mode}' is invalid; "
                        "review controls peer depth and must not encode QA gates")
        if qa_mode not in qa_modes:
            errs.append(f"harness.yaml: profile '{profile}' qa '{qa_mode}' is invalid; "
                        "QA is epic-wide plus high-risk tasks only")
        phases = policy.get("phases") if isinstance(policy, dict) else None
        if not isinstance(phases, list):
            errs.append(f"harness.yaml: profile '{profile}' phases must be an explicit list")
            continue
        positions = [order_index.get(phase, -1) for phase in phases]
        unknown = [phase for phase, pos in zip(phases, positions) if pos < 0]
        if unknown:
            errs.append(f"harness.yaml: profile '{profile}' has unknown phases: {unknown}")
            continue
        if positions != sorted(positions):
            errs.append(f"harness.yaml: profile '{profile}' phases are out of phase_order")
        selected = set(phases)
        for phase in phases:
            missing = [req for req in dependencies.get(phase, []) if req not in selected]
            if missing:
                errs.append(f"harness.yaml: profile '{profile}' phase '{phase}' "
                            f"is missing prerequisites {missing}")
        if "build" in selected and "srs_approval" not in (policy.get("human_gates") or []):
            errs.append(f"harness.yaml: profile '{profile}' can build without srs_approval")


def check_mcp_allowlists(errs, warns):
    registry_path = os.path.join(ROOT, "harness", "mcp", "servers.json")
    project_path = os.path.join(ROOT, ".mcp.json")
    try:
        with open(registry_path, encoding="utf-8") as f:
            registry_data = json.load(f)
        registry = registry_data.get("mcpServers") or {}
    except (OSError, json.JSONDecodeError) as e:
        errs.append(f"harness/mcp/servers.json: invalid MCP registry ({e})")
        return
    if not isinstance(registry, dict):
        errs.append("harness/mcp/servers.json: mcpServers must be a mapping")
        return
    try:
        with open(project_path, encoding="utf-8") as f:
            project = json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        errs.append(f".mcp.json: invalid fail-closed project config ({e})")
        project = {}
    if (project.get("mcpServers") or {}):
        errs.append(".mcp.json: project scope must stay empty; adapters generate "
                    "role-filtered configs from harness/mcp/servers.json")

    for path in sorted(glob.glob(os.path.join(ROOT, "harness", "agents", "*.md"))):
        if os.path.basename(path) == "README.md":
            continue
        data = frontmatter(path) or {}
        unknown = sorted(set(data.get("mcp") or []) - set(registry))
        if unknown:
            errs.append(f"{os.path.relpath(path, ROOT)}: unknown MCP servers {unknown}")


def check_epics_tasks(errs, warns):
    for ep in sorted(glob.glob(abspath("epics", "E*", "epic.md"))):
        rel = os.path.relpath(ep, ROOT)
        fm = frontmatter(ep) or {}
        eid = str(fm.get("id") or "")
        if not EPIC_ID.match(eid):
            errs.append(f"{rel}: epic id '{eid}' does not match E<NN>")
        for tp in sorted(glob.glob(os.path.join(os.path.dirname(ep), "tasks", "*.md"))):
            trel = os.path.relpath(tp, ROOT)
            t = frontmatter(tp)
            if t is None:
                errs.append(f"{trel}: missing or unparseable frontmatter")
                continue
            tid = str(t.get("id") or "")
            if not TASK_ID.match(tid):
                errs.append(f"{trel}: task id '{tid}' does not match E<NN>-T<MM> / E<NN>-B<MM>")
            tier = str(t.get("tier") or "")
            if tier not in ("deep", "build", "cheap"):
                errs.append(f"{trel}: tier '{tier or '<missing>'}' must be deep|build|cheap")
            for ref in t.get("traces_to") or []:
                if not TRACE_ID.match(str(ref)):
                    errs.append(f"{trel}: traces_to id '{ref}' outside the constitution's ID grammar")
            files = t.get("files")
            if not isinstance(files, dict) or not ("create" in files or "update" in files):
                errs.append(f"{trel}: mandatory frontmatter 'files: {{create: [], update: []}}' missing "
                            f"(scheduler collision guard)")
            elif t.get("status") in ("in-progress", "review-requested") and not (
                    (files.get("create") or []) + (files.get("update") or [])):
                warns.append(f"{trel}: in-flight with empty files: lists — collision guard inert")
            executed, reviewed = t.get("executed_by"), t.get("reviewed_by")
            if reviewed and executed and str(reviewed).strip() == str(executed).strip():
                errs.append(f"{trel}: reviewed_by == executed_by ('{reviewed}') violates the peer rule (rule 12)")
            if str(t.get("status")) in ("done", "verified") and executed and not reviewed:
                errs.append(f"{trel}: status '{t.get('status')}' but no reviewed_by recorded")


def check_state_schema(errs, warns):
    """State keeps blocker references only; question details belong to the register."""
    path = abspath("state")
    try:
        with open(path, encoding="utf-8") as state_file:
            state = yaml.safe_load(state_file) or {}
    except (OSError, yaml.YAMLError) as error:
        errs.append(f"{os.path.relpath(path, ROOT)}: missing or invalid state ({error})")
        return
    if not isinstance(state, dict):
        errs.append(f"{os.path.relpath(path, ROOT)}: state must be a mapping")
        return
    blockers = state.get("blockers") or []
    if not isinstance(blockers, list):
        errs.append(f"{os.path.relpath(path, ROOT)}: blockers must be a list of Q-### IDs")
        return
    seen = set()
    for blocker in blockers:
        if not isinstance(blocker, str) or not QUESTION_ID.fullmatch(blocker):
            errs.append(f"{os.path.relpath(path, ROOT)}: blocker {blocker!r} must be an "
                        "ID-only Q-### entry; details belong in workspace/open-questions.md")
            continue
        if blocker in seen:
            errs.append(f"{os.path.relpath(path, ROOT)}: duplicate blocker ID '{blocker}'")
        seen.add(blocker)


def load_scopes():
    cfg = load_config()
    ws = cfg.get("write_scopes") or {}
    shared = list(ws.get("shared") or [])
    groups = {
        name: list(ws.get(name) or [])
        for name in ("product_code", "test_code")
    }
    roles = {}
    for role, paths in ws.items():
        if role == "shared" or role in groups:
            continue
        expanded = []
        for p in paths or []:
            expanded.extend(groups[p] if p in groups else [p])
        roles[role] = expanded
    return roles, shared, groups


def check_write_scopes(errs, warns):
    roles, shared, _ = load_scopes()
    if not roles:
        return
    for tp in sorted(glob.glob(abspath("epics", "E*", "tasks", "*.md"))):
        trel = os.path.relpath(tp, ROOT)
        t = frontmatter(tp) or {}
        owner = str(t.get("owner_agent") or "")
        files = t.get("files") or {}
        paths = (files.get("create") or []) + (files.get("update") or [])
        if not owner:
            if paths:
                warns.append(f"{trel}: files: planned but no owner_agent — scope unchecked")
            continue
        if owner not in roles:
            errs.append(f"{trel}: owner_agent '{owner}' has no write_scopes entry in harness.yaml")
            continue
        allowed = roles[owner] + shared
        for path in paths:
            p = str(path)
            if not any(path_allowed(p, a) for a in allowed):
                errs.append(f"{trel}: '{p}' is outside {owner}'s write_scopes "
                            f"(harness.yaml guardrail)")


def clean_repo_path(path):
    p = os.path.normpath(str(path).replace("\\", "/"))
    while p.startswith("./"):
        p = p[2:]
    return "" if p == "." else p


def path_allowed(path, allowed):
    p = clean_repo_path(path)
    a_raw = str(allowed)
    a = clean_repo_path(a_raw)
    if not a:
        return False
    if a_raw.endswith("/"):
        return p == a or p.startswith(a + "/")
    return p == a


def check_lessons(errs, warns):
    readme = os.path.join(ROOT, "harness", "memory", "lessons", "README.md")
    if not os.path.isfile(readme):
        errs.append("harness/memory/lessons/README.md missing")
        return
    for area in re.findall(r"`([a-z-]+)\.md`", open(readme, encoding="utf-8").read()):
        if area == "_template":
            continue
        if not os.path.isfile(os.path.join(ROOT, "harness", "memory", "lessons", f"{area}.md")):
            errs.append(f"harness/memory/lessons/{area}.md promised by the lessons README but missing")


README_DIRS = [
    "harness", "harness/agents", "harness/skills", "harness/workflows",
    "harness/orchestrator", "harness/adapters", "harness/hooks", "harness/handoffs",
    "harness/memory", "harness/memory/lessons", "harness/memory/decisions",
    "harness/memory/graphiti", "harness/mcp", "harness/rates", "harness/docs",
    "harness/templates", "workspace", "workspace/docs", "workspace/docs/business",
    "workspace/docs/design", "workspace/plan", "workspace/assets",
    "workspace/plan/03-technical/decisions",
    "workspace/epics", "workspace/spec", "workspace/dashboard", "workspace/runs",
]


def check_readmes(errs, warns):
    """Every portion of the harness explains itself: why it exists, how it
    works, what it does not cover (see the folder-README convention)."""
    for d in README_DIRS:
        if not os.path.isfile(os.path.join(ROOT, d, "README.md")):
            errs.append(f"{d}/README.md missing — every harness folder must explain "
                        f"why it exists, how it works, and what it does not cover")


def check_path_refs(errs, warns):
    sources = [os.path.join(ROOT, "AGENTS.md"), os.path.join(ROOT, "CLAUDE.md")]
    sources += glob.glob(os.path.join(ROOT, "harness", "agents", "*.md"))
    sources += glob.glob(os.path.join(ROOT, "harness", "skills", "*", "SKILL.md"))
    for src in sources:
        rel = os.path.relpath(src, ROOT)
        for ref in PATH_REF.findall(open(src, encoding="utf-8").read()):
            if any(ch in ref for ch in "<>*#?…"):
                continue
            target = os.path.join(ROOT, ref)
            if not (os.path.isfile(target) or os.path.isdir(target)):
                warns.append(f"{rel}: references '{ref}' which does not exist")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--strict", action="store_true", help="treat warnings as errors")
    args = ap.parse_args()
    errs, warns = [], []
    for check in (check_agents, check_skills, check_pipeline_profiles,
                  check_mcp_allowlists,
                  check_epics_tasks, check_state_schema, check_write_scopes, check_lessons,
                  check_readmes, check_path_refs):
        check(errs, warns)
    for w in warns:
        print(f"harness: ⚠ {w}")
    for e in errs:
        print(f"harness: ✗ {e}")
    n_agents = len([p for p in glob.glob(os.path.join(ROOT, "harness", "agents", "*.md"))
                    if os.path.basename(p) != "README.md" and not os.path.basename(p).startswith("_")])
    n_skills = len(glob.glob(os.path.join(ROOT, "harness", "skills", "*", "SKILL.md")))
    if errs or (args.strict and warns):
        sys.exit(f"harness: validation FAILED — {len(errs)} error(s), {len(warns)} warning(s)")
    print(f"harness: {n_agents} agents, {n_skills} skills, "
          f"{len(warns)} warning(s) — constitution checks OK ✓")


if __name__ == "__main__":
    main()
