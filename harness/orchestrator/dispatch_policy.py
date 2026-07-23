#!/usr/bin/env python3
"""Resolve portable task routing and generate role-scoped MCP configuration."""
import argparse
import glob
import json
import os
import re
import sys

try:
    import yaml
except ImportError:
    sys.exit("harness: pip install pyyaml (see requirements.txt)")

sys.path.insert(0, os.path.dirname(__file__))
from paths import ROOT, abspath, load_config, root_rel

PLATFORMS = {"claude-code", "codex", "opencode"}
TIERS = {"deep", "build", "cheap"}
MCP_REGISTRY = os.path.join(ROOT, "harness", "mcp", "servers.json")


def frontmatter(path):
    try:
        with open(path, encoding="utf-8") as f:
            text = f.read()
    except OSError as e:
        raise RuntimeError(f"cannot read {root_rel(path)}: {e}") from e
    match = re.match(r"\s*---\s*\n(.*?)\n---\s*\n", text, re.S)
    if not match:
        raise RuntimeError(f"{root_rel(path)} has no YAML frontmatter")
    try:
        data = yaml.safe_load(match.group(1)) or {}
    except yaml.YAMLError as e:
        raise RuntimeError(f"cannot parse {root_rel(path)}: {e}") from e
    if not isinstance(data, dict):
        raise RuntimeError(f"{root_rel(path)} frontmatter must be a mapping")
    return data


def task_file(task_id):
    hits = glob.glob(abspath("epics", "E*", "tasks", f"{task_id}-*.md"))
    hits += glob.glob(abspath("epics", "E*", "tasks", f"{task_id}.md"))
    hits = sorted(set(hits))
    if len(hits) != 1:
        raise RuntimeError(
            f"expected one task file for {task_id}, found {len(hits)}"
        )
    return hits[0]


def role_file(role):
    path = os.path.join(ROOT, "harness", "agents", f"{role}.md")
    if not os.path.isfile(path):
        raise RuntimeError(f"unknown role '{role}': {root_rel(path)} is missing")
    return path


def resolve_model(cfg, tier, platform):
    tier = str(tier or "").strip()
    platform = str(platform or "").strip()
    if tier not in TIERS:
        raise RuntimeError(
            f"routing tier '{tier or '<missing>'}' is invalid; expected "
            + "|".join(sorted(TIERS))
        )
    if platform not in PLATFORMS:
        raise RuntimeError(
            f"platform '{platform or '<missing>'}' is invalid; expected "
            + "|".join(sorted(PLATFORMS))
        )
    mapping = (cfg.get("model_tiers") or {}).get(tier) or {}
    model = mapping.get(platform)
    if not model:
        raise RuntimeError(
            f"model_tiers.{tier}.{platform} is unset; refusing silent fallback"
        )
    return str(model)


def load_registry():
    try:
        with open(MCP_REGISTRY, encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        raise RuntimeError(f"cannot read MCP registry {root_rel(MCP_REGISTRY)}: {e}") from e
    servers = data.get("mcpServers") if isinstance(data, dict) else None
    if not isinstance(servers, dict):
        raise RuntimeError("MCP registry must contain an mcpServers mapping")
    return servers


def toml_value(value):
    if isinstance(value, str):
        return json.dumps(value)
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        return "[" + ",".join(toml_value(item) for item in value) + "]"
    if isinstance(value, dict):
        return "{" + ",".join(
            f"{key}={toml_value(item)}" for key, item in value.items()
        ) + "}"
    raise RuntimeError(f"unsupported MCP configuration value: {value!r}")


def codex_server(server):
    if server.get("url"):
        return {"url": server["url"]}
    result = {"command": server.get("command"), "args": server.get("args") or []}
    if server.get("env"):
        result["env"] = server["env"]
    return result


def opencode_value(value):
    if isinstance(value, str):
        return re.sub(r"\$\{([A-Za-z_][A-Za-z0-9_]*)\}", r"{env:\1}", value)
    if isinstance(value, list):
        return [opencode_value(item) for item in value]
    if isinstance(value, dict):
        return {key: opencode_value(item) for key, item in value.items()}
    return value


def opencode_server(server, enabled):
    if server.get("url"):
        return {"type": "remote", "url": server["url"], "enabled": enabled}
    command = opencode_value(
        [server.get("command")] + list(server.get("args") or [])
    )
    result = {"type": "local", "command": command, "enabled": enabled}
    if server.get("env"):
        result["environment"] = opencode_value(server["env"])
    return result


def write_mcp_config(platform, allowed, registry, path):
    unknown = sorted(set(allowed) - set(registry))
    if unknown:
        raise RuntimeError(f"role MCP allowlist references unknown servers: {unknown}")
    selected = {name: registry[name] for name in allowed}
    if platform == "claude-code":
        payload = {"mcpServers": selected}
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
            f.write("\n")
        return
    if platform == "opencode":
        payload = {
            "mcp": {
                name: opencode_server(server, name in selected)
                for name, server in registry.items()
            }
        }
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, separators=(",", ":"))
            f.write("\n")
        return
    if platform == "codex":
        with open(path, "w", encoding="utf-8") as f:
            for name, server in selected.items():
                f.write("-c\n")
                f.write(f"mcp_servers.{name}={toml_value(codex_server(server))}\n")
        return
    raise RuntimeError(f"unsupported platform '{platform}'")


def build_policy(task_id, platform, role_override=None):
    cfg = load_config()
    task_path = task_file(task_id) if task_id else None
    task = frontmatter(task_path) if task_path else {}
    role = str(role_override or task.get("owner_agent") or "").strip()
    if not role:
        raise RuntimeError("dispatch requires a task owner_agent or explicit --role")
    role_path = role_file(role)
    role_data = frontmatter(role_path)
    if task_path:
        tier = str(task.get("tier") or "").strip()
        if tier not in TIERS:
            raise RuntimeError(
                f"{task_id}: task tier '{tier or '<missing>'}' is invalid; "
                f"expected {'|'.join(sorted(TIERS))}; role-tier fallback is "
                "only allowed for explicit pipeline-role runs"
            )
    else:
        tier = str(role_data.get("tier") or "").strip()
    model = resolve_model(cfg, tier, platform)
    allowed = [str(name) for name in (role_data.get("mcp") or [])]
    registry = load_registry()
    unknown = sorted(set(allowed) - set(registry))
    if unknown:
        raise RuntimeError(f"{role} MCP allowlist references unknown servers: {unknown}")
    return {
        "task": task_id or None,
        "task_path": root_rel(task_path) if task_path else None,
        "role": role,
        "role_path": root_rel(role_path),
        "platform": platform,
        "tier": tier,
        "model": model,
        "mcp_allowlist": allowed,
    }, registry


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--task", default="")
    parser.add_argument("--platform", required=True, choices=sorted(PLATFORMS))
    parser.add_argument("--role", default="")
    parser.add_argument("--mcp-out", required=True)
    args = parser.parse_args()
    if not args.task and not args.role:
        parser.error("one of --task or --role is required")
    try:
        policy, registry = build_policy(
            args.task or None, args.platform, args.role or None
        )
        write_mcp_config(
            args.platform, policy["mcp_allowlist"], registry, args.mcp_out
        )
    except RuntimeError as e:
        sys.exit(f"harness: {e}")
    print(json.dumps(policy, indent=2))


if __name__ == "__main__":
    main()
