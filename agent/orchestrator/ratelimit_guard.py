#!/usr/bin/env python3
"""the harness rate-limit guard — decide whether to freeze + hand off.

Reads Claude Code statusLine JSON on stdin (>=2.1.x passes a `rate_limits`
object with five_hour / seven_day buckets — exact field names vary by
version, so probing is defensive). Prints a one-line status (usable as the
statusline text) and exits:
  0 = OK to continue        2 = FREEZE: run agent/workflows/handoff-freeze.md

Threshold comes from harness.yaml (platforms[claude-code].freeze_threshold_pct,
default 80). Manual check without stdin:  echo '{}' | python3 ratelimit_guard.py
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def threshold():
    try:
        import yaml
        cfg = yaml.safe_load(open(os.path.join(ROOT, "harness.yaml"), encoding="utf-8")) or {}
        for p in cfg.get("platforms") or []:
            if p.get("name") == "claude-code":
                return float(p.get("freeze_threshold_pct", 80))
    except Exception:
        pass
    return 80.0


def pct_of(bucket):
    """Extract a utilization percentage from whatever shape this version sends."""
    if not isinstance(bucket, dict):
        return None
    for k in ("utilization", "used_pct", "percent_used", "pct"):
        if isinstance(bucket.get(k), (int, float)):
            v = float(bucket[k])
            return v * 100 if v <= 1 else v
    used, limit = bucket.get("used"), bucket.get("limit")
    if isinstance(used, (int, float)) and isinstance(limit, (int, float)) and limit:
        return 100.0 * used / limit
    remaining = bucket.get("remaining")
    if isinstance(remaining, (int, float)) and isinstance(limit, (int, float)) and limit:
        return 100.0 * (limit - remaining) / limit
    return None


def main():
    raw = sys.stdin.read() if not sys.stdin.isatty() else ""
    try:
        data = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        data = {}
    rl = data.get("rate_limits") or data.get("rateLimits") or {}
    five = pct_of(rl.get("five_hour") or rl.get("fiveHour") or {})
    week = pct_of(rl.get("seven_day") or rl.get("sevenDay") or rl.get("weekly") or {})
    th = threshold()

    parts, freeze = [], False
    if five is not None:
        parts.append(f"5h {five:.0f}%")
        freeze |= five >= th
    if week is not None:
        parts.append(f"wk {week:.0f}%")
        freeze |= week >= max(th, 90)  # weekly is the harder wall — be stricter
    if not parts:
        print("harness | window: n/a (no rate_limits in payload — check /usage manually)")
        sys.exit(0)
    flag = " ⏸ FREEZE" if freeze else ""
    print(f"harness | {' · '.join(parts)} (freeze@{th:.0f}%){flag}")
    sys.exit(2 if freeze else 0)


if __name__ == "__main__":
    main()
