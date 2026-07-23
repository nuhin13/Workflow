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
import argparse, glob, os, re, sys

try:
    import yaml
except ImportError:
    sys.exit("harness: pip install pyyaml (see requirements.txt)")

sys.path.insert(0, os.path.dirname(__file__))
from paths import ROOT, abspath

TASK_ID = re.compile(r"^E\d{2}-[TB]\d{2}$")
EPIC_ID = re.compile(r"^E\d{2}$")
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


def load_scopes():
    try:
        cfg = yaml.safe_load(open(os.path.join(ROOT, "harness.yaml"), encoding="utf-8")) or {}
    except (OSError, yaml.YAMLError):
        return {}, [], []
    ws = cfg.get("write_scopes") or {}
    shared = list(ws.get("shared") or [])
    product = list(ws.get("product_code") or [])
    roles = {}
    for role, paths in ws.items():
        if role in ("shared", "product_code"):
            continue
        expanded = []
        for p in paths or []:
            expanded.extend(product if p == "product_code" else [p])
        roles[role] = expanded
    return roles, shared, product


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
    for check in (check_agents, check_skills, check_epics_tasks, check_write_scopes, check_lessons, check_readmes, check_path_refs):
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
