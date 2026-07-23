#!/usr/bin/env python3
"""Shared path resolution for harness scripts.

All live project artifacts are configured through `harness.yaml: paths`.
Scripts should use this module instead of hard-coding workspace folders.
"""
import os
import sys

try:
    import yaml
except ImportError:
    yaml = None

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DEFAULT_PATHS = {
    "workspace_root": "workspace/",
    "docs": "workspace/docs/",
    "business_docs": "workspace/docs/business/",
    "design_docs": "workspace/docs/design/",
    "spec": "workspace/spec/",
    "epics": "workspace/epics/",
    "runs": "workspace/runs/",
    "dashboard": "workspace/dashboard/",
    "workspace": "workspace/plan/",
    "plan": "workspace/plan/",
    "assets": "workspace/assets/",
    "questions": "workspace/open-questions.md",
    "state": "workspace/state.yaml",
    "handoffs": "harness/handoffs/",
    "rates": "harness/rates/cost-config.yaml",
    "templates": "harness/templates/",
    "lessons": "harness/memory/lessons/",
    "decisions": "harness/memory/decisions/",
}


def load_config():
    if yaml is None:
        return {}
    try:
        with open(os.path.join(ROOT, "harness.yaml"), encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
    except (OSError, yaml.YAMLError):
        return {}
    return data if isinstance(data, dict) else {}


def all_paths():
    cfg = load_config()
    merged = dict(DEFAULT_PATHS)
    merged.update((cfg.get("paths") or {}))
    return merged


def relpath(key, *parts):
    paths = all_paths()
    if key not in paths:
        raise KeyError(f"unknown harness path key: {key}")
    base = str(paths[key]).strip()
    return os.path.normpath(os.path.join(base, *[str(p) for p in parts]))


def abspath(key, *parts):
    rel = relpath(key, *parts)
    return rel if os.path.isabs(rel) else os.path.join(ROOT, rel)


def root_rel(path):
    return os.path.relpath(path, ROOT)


def href_from(base_key, target_path):
    """Return an href from a configured directory to a target file or folder."""
    base = abspath(base_key)
    return os.path.relpath(target_path, base)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        for key, value in sorted(all_paths().items()):
            print(f"{key}: {value}")
        sys.exit(0)
    print(relpath(sys.argv[1], *sys.argv[2:]))
