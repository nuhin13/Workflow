#!/usr/bin/env python3
"""Harness scheduler — validate the task DAG, report status, pick what's next.

Usage:
  python3 harness/orchestrator/scheduler.py --validate
  python3 harness/orchestrator/scheduler.py --next [--platform P] [--limit N] [--layer L] [--tight]
  python3 harness/orchestrator/scheduler.py --status
  python3 harness/orchestrator/scheduler.py --review-queue

Reads the configured epics path + tasks/*.md (YAML frontmatter).
Dispatch is scoped to `current_epic` from the configured state file; advancing
that value is owned by the human-approved checkpoint flow.
Statuses: todo → in-progress → review-requested → (changes-requested →)
done → verified · side: blocked, frozen.
Pick order: P1 bugs → MoSCoW → parent-epic WSJF → critical path → (--tight)
smallest token tier. Skips tasks colliding on files with in-flight tasks
(optional frontmatter `files:` mirror) and respects the WIP limit.
"""
import argparse, glob, json, os, re, sys
try:
    import yaml
except ImportError:
    sys.exit("harness: pip install pyyaml (see requirements.txt)")

sys.path.insert(0, os.path.dirname(__file__))
from paths import ROOT, abspath, load_config, root_rel
from dispatch_policy import PLATFORMS, TIERS, resolve_model

MOSCOW = {"must": 0, "should": 1, "could": 2, "wont": 3}
TIER = {"S": 0, "M": 1, "L": 2}
DONE = {"done", "verified"}
IN_FLIGHT = {"in-progress", "review-requested", "changes-requested"}
ORDER = ["todo", "in-progress", "review-requested", "changes-requested",
         "blocked", "frozen", "done", "verified"]


def frontmatter(path):
    try:
        text = open(path, encoding="utf-8").read()
    except OSError:
        return {}
    m = re.match(r"\s*---\s*\n(.*?)\n---\s*\n", text, re.S)
    if not m:
        return {}
    try:
        data = yaml.safe_load(m.group(1)) or {}
        return data if isinstance(data, dict) else {}
    except yaml.YAMLError as e:
        print(f"harness: ⚠ bad frontmatter in {os.path.relpath(path, ROOT)}: {e}", file=sys.stderr)
        return {}


def deps(t):
    return list(t.get("depends_on") or t.get("depends") or [])


def load():
    epics, tasks = {}, {}
    for ep in sorted(glob.glob(abspath("epics", "E*", "epic.md"))):
        fm = frontmatter(ep)
        eid = str(fm.get("id") or os.path.basename(os.path.dirname(ep)).split("-")[0])
        fm.setdefault("wsjf", (fm.get("priority") or {}).get("wsjf", 0))
        epics[eid] = fm
        for tp in sorted(glob.glob(os.path.join(os.path.dirname(ep), "tasks", "*.md"))):
            t = frontmatter(tp)
            tid = str(t.get("id") or os.path.splitext(os.path.basename(tp))[0])
            t["_path"], t["_epic"], t["id"] = root_rel(tp), eid, tid
            t.setdefault("status", "todo")
            tasks[tid] = t
    return epics, tasks


def load_active_epic():
    """Read the checkpoint-controlled dispatch scope from project state."""
    state_path = abspath("state")
    try:
        with open(state_path, encoding="utf-8") as f:
            state = yaml.safe_load(f) or {}
    except OSError as e:
        raise RuntimeError(f"cannot read {root_rel(state_path)}: {e}") from e
    except yaml.YAMLError as e:
        raise RuntimeError(f"cannot parse {root_rel(state_path)}: {e}") from e
    if not isinstance(state, dict):
        raise RuntimeError(f"{root_rel(state_path)} must contain a YAML mapping")
    current = state.get("current_epic")
    return str(current).strip() if current is not None and str(current).strip() else None


def validate(epics, tasks, cfg=None):
    errs = []
    cfg = cfg or load_config()
    for tid, t in tasks.items():
        for d in deps(t):
            if d not in tasks and d not in epics:
                errs.append(f"{tid}: unknown dependency '{d}'")
        if str(t.get("status")) not in ORDER:
            errs.append(f"{tid}: unknown status '{t.get('status')}'")
        if t.get("status") == "todo" and not (t.get("traces_to") or t.get("type") == "genesis"):
            errs.append(f"{tid}: missing traces_to (spec is law)")
        tier = str(t.get("tier") or "")
        if tier not in TIERS:
            errs.append(f"{tid}: tier '{tier or '<missing>'}' must be "
                        f"one of {sorted(TIERS)}")
    children = {k: [] for k in tasks}
    indeg = {k: 0 for k in tasks}
    for k, t in tasks.items():
        for d in deps(t):
            if d in tasks:
                children[d].append(k)
                indeg[k] += 1
    q, seen = [k for k, v in indeg.items() if v == 0], 0
    while q:
        n = q.pop(); seen += 1
        for c in children[n]:
            indeg[c] -= 1
            if indeg[c] == 0:
                q.append(c)
    if seen != len(tasks):
        errs.append(f"dependency CYCLE among {len(tasks) - seen} task(s)")
    return errs, children


def dispatch_count(pick_count, slots, limit=0):
    if limit < 0:
        raise ValueError("--limit cannot be negative")
    requested = limit if limit else slots
    return min(pick_count, slots, requested)


def chain_len(tid, children, memo):
    if tid in memo:
        return memo[tid]
    memo[tid] = 1 + max((chain_len(c, children, memo) for c in children.get(tid, [])), default=0)
    return memo[tid]


def ready(epics, tasks, children, active_epic, layer=None, tight=False):
    in_flight = [t for t in tasks.values() if t.get("status") in IN_FLIGHT]
    busy = set()
    for t in in_flight:
        f = t.get("files") or {}
        busy.update((f.get("create") or []) + (f.get("update") or []))
    memo, out = {}, []
    for tid, t in tasks.items():
        if t.get("_epic") != active_epic:
            continue
        if t.get("status") != "todo":
            continue
        if layer and str(t.get("layer", "")) != layer:
            continue
        unmet = any((tasks.get(d, {}).get("status") not in DONE) if d in tasks
                    else (epics.get(d, {}).get("status") not in DONE) for d in deps(t))
        if unmet:
            continue
        f = t.get("files") or {}
        mine = set((f.get("create") or []) + (f.get("update") or []))
        if mine & busy:
            continue
        pr = t.get("priority") or {}
        p1bug = 0 if (t.get("type") == "bug" and str(pr.get("p", "")).upper() == "P1") else 1
        mos = MOSCOW.get(str(pr.get("moscow", "should")).lower(), 1)
        wsjf = -(float((epics.get(t["_epic"], {}) or {}).get("wsjf") or 0))
        crit = -chain_len(tid, children, memo)
        tier = TIER.get(str((t.get("token_estimate") or {}).get("tier", "M")).upper(), 1) if tight else 0
        out.append((p1bug, mos, wsjf, crit, tier, tid))
    out.sort()
    return [tid for *_, tid in out], len(in_flight)


def show_status(epics, tasks):
    tot = {s: 0 for s in ORDER}
    print(f"{'epic':<6} {'title':<42} {'prog':>7}  per-status")
    for eid, e in sorted(epics.items()):
        mine = [t for t in tasks.values() if t["_epic"] == eid]
        c = {s: 0 for s in ORDER}
        for t in mine:
            c[str(t.get("status"))] = c.get(str(t.get("status")), 0) + 1
            tot[str(t.get("status"))] = tot.get(str(t.get("status")), 0) + 1
        donez = c["done"] + c["verified"]
        line = " ".join(f"{s}:{c[s]}" for s in ORDER if c[s])
        print(f"{eid:<6} {str(e.get('title',''))[:42]:<42} {donez:>3}/{len(mine):<3}  {line or '—'}")
    print("totals: " + " ".join(f"{s}:{tot[s]}" for s in ORDER if tot[s]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--validate", action="store_true")
    ap.add_argument("--next", action="store_true")
    ap.add_argument("--status", action="store_true")
    ap.add_argument("--review-queue", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--platform", choices=sorted(PLATFORMS), default=None,
                    help="active worker platform; required when tasks are dispatchable")
    ap.add_argument("--layer", default=None, help="backend|frontend|cli|infra|docs|cross-cutting")
    ap.add_argument("--tight", action="store_true", help="rate-limit window low: prefer small tasks")
    a = ap.parse_args()
    epics, tasks = load()
    cfg = load_config()
    errs, children = validate(epics, tasks, cfg)

    if a.status:
        show_status(epics, tasks); sys.exit(0)
    if a.review_queue:
        q = [t for t in tasks.values() if t.get("status") in ("review-requested", "changes-requested")]
        for t in sorted(q, key=lambda x: x["id"]):
            print(f"{t['id']:<10} {t.get('status'):<18} executed_by={t.get('executed_by') or '?'}  {t['_path']}")
        print(f"harness: {len(q)} in review queue"); sys.exit(0)
    if a.validate or not a.next:
        for e in errs:
            print("✗", e)
        print(f"harness: {len(epics)} epics, {len(tasks)} tasks — " + ("DAG OK ✓" if not errs else f"{len(errs)} problem(s)"))
        sys.exit(1 if errs else 0)
    if errs:
        print("harness: fix --validate errors first", file=sys.stderr); sys.exit(1)

    try:
        active_epic = load_active_epic()
    except RuntimeError as e:
        print(f"harness: {e}", file=sys.stderr)
        sys.exit(1)
    if tasks and not active_epic:
        print("harness: workspace state has no current_epic; /dev-plan or "
              "/checkpoint must select one before dispatch", file=sys.stderr)
        sys.exit(1)
    if active_epic and active_epic not in epics:
        print(f"harness: current_epic '{active_epic}' has no epic spec; "
              "repair workspace state before dispatch", file=sys.stderr)
        sys.exit(1)

    picks, in_flight = ready(
        epics, tasks, children, active_epic=active_epic,
        layer=a.layer, tight=a.tight,
    )
    wip = int(((cfg.get("scheduler") or {}).get("wip_limit_parallel_agents")) or 3)
    slots = max(0, wip - in_flight)
    try:
        n = dispatch_count(len(picks), slots, a.limit)
    except ValueError as e:
        print(f"harness: {e}", file=sys.stderr)
        sys.exit(2)

    platform = a.platform or os.environ.get("HARNESS_PLATFORM")
    if n and not platform:
        print("harness: dispatchable tasks require --platform or "
              "HARNESS_PLATFORM; no platform is the default", file=sys.stderr)
        sys.exit(1)
    result = []
    for tid in picks[:n]:
        task = tasks[tid]
        tier = str(task.get("tier") or "")
        try:
            model = resolve_model(cfg, tier, platform)
        except RuntimeError as e:
            print(f"harness: {tid}: {e}", file=sys.stderr)
            sys.exit(1)
        result.append({
            "task": tid,
            "epic": task["_epic"],
            "layer": task.get("layer", ""),
            "platform": platform,
            "tier": tier,
            "model": model,
            "owner": task.get("owner_agent", "developer-backend"),
            "preferred_agent": task.get("preferred_agent", "any"),
            "path": task["_path"],
        })
    print(json.dumps({"active_epic": active_epic, "in_flight": in_flight,
                      "wip_limit": wip, "available_slots": slots,
                      "next": result}, indent=2))


if __name__ == "__main__":
    main()
