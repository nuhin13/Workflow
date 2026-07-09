#!/usr/bin/env python3
"""the harness dashboard builder — one static HTML file, zero dependencies to view.

  python3 agent/orchestrator/dashboard_build.py        # → dashboard/index.html

Reads epics/*/epic.md, epics/*/tasks/*.md, epics/*/metrics.csv and renders:
project totals, per-epic progress + token/cost (vs budget), per-model spend.
Serve it from anywhere (it's just a file):  python3 -m http.server -d dashboard
"""
import csv, datetime, glob, html, os, re, sys
try:
    import yaml
except ImportError:
    sys.exit("harness: pip install pyyaml (see requirements.txt)")
from metrics_report import ACTIVE_STATUSES, add_row, empty_bucket, estimate_cost, load_rates, task_estimate

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATUS_ORDER = ["verified", "done", "review-requested", "changes-requested", "in-progress", "frozen", "blocked", "todo"]
COLORS = {"verified": "#34D399", "done": "#2DD4BF", "review-requested": "#7DD3FC",
          "changes-requested": "#FBBF24", "in-progress": "#8B7CF6",
          "frozen": "#F5A524", "blocked": "#F06A5D", "todo": "#3B4654"}


def fm(path):
    m = re.match(r"\s*---\s*\n(.*?)\n---\s*\n", open(path, encoding="utf-8").read(), re.S)
    try:
        return (yaml.safe_load(m.group(1)) or {}) if m else {}
    except yaml.YAMLError:
        return {}


def fnum(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def load():
    cfg = {}
    try:
        cfg = yaml.safe_load(open(os.path.join(ROOT, "harness.yaml"), encoding="utf-8")) or {}
    except OSError:
        pass
    warn = fnum((cfg.get("budgets") or {}).get("per_epic_warn_usd")) or 60.0
    project = cfg.get("project") or os.path.basename(ROOT)
    rate_models, rate_aliases = load_rates()
    epics = []
    for d in sorted(glob.glob(os.path.join(ROOT, "epics", "E*"))):
        ep_md = os.path.join(d, "epic.md")
        if not os.path.isfile(ep_md):
            continue
        e = fm(ep_md)
        eid = str(e.get("id") or os.path.basename(d).split("-")[0])
        counts = {s: 0 for s in STATUS_ORDER}
        bugs_open = 0
        task_rows = []
        task_usage = {}
        for tp in sorted(glob.glob(os.path.join(d, "tasks", "*.md"))):
            t = fm(tp)
            tid = str(t.get("id") or os.path.splitext(os.path.basename(tp))[0])
            status = str(t.get("status", "todo"))
            counts[status] = counts.get(status, 0) + 1
            if t.get("type") == "bug" and t.get("status") not in ("done", "verified"):
                bugs_open += 1
            bucket = empty_bucket(tid)
            bucket["status"] = status
            bucket["estimate"] = task_estimate(t)
            bucket["epic"] = eid
            task_usage[tid] = bucket
            task_rows.append(bucket)
        cost = toks = 0.0
        models = {}
        mpath = os.path.join(d, "metrics.csv")
        if os.path.isfile(mpath):
            for r in csv.DictReader(open(mpath, encoding="utf-8")):
                tid = str(r.get("task_id") or "").strip()
                if tid:
                    bucket = task_usage.setdefault(tid, empty_bucket(tid))
                    bucket["epic"] = eid
                    if bucket not in task_rows:
                        task_rows.append(bucket)
                    add_row(bucket, r, rate_models, rate_aliases)
                c = fnum(r.get("cost_usd")) if str(r.get("cost_usd") or "").strip() else estimate_cost(r, rate_models, rate_aliases)
                cost += c
                toks += fnum(r.get("input")) + fnum(r.get("output")) + \
                        fnum(r.get("cache_read")) + fnum(r.get("cache_creation"))
                if r.get("model"):
                    models[r["model"]] = models.get(r["model"], 0.0) + c
        for task in task_rows:
            task["missing_usage"] = task["runs"] == 0 and task.get("status") in ACTIVE_STATUSES
        epics.append(dict(id=eid, dir=os.path.basename(d),
                          title=e.get("title", os.path.basename(d)),
                          status=e.get("status", "todo"),
                          wsjf=e.get("wsjf", ""), counts=counts, bugs=bugs_open,
                          cost=cost, tokens=toks, models=models, tasks=task_rows))
    return project, warn, epics


PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>@@PROJECT@@ — the harness console</title>
<style>
:root{--ink:#0B0F14;--panel:#121821;--line:#1E2733;--txt:#E6EDF3;--dim:#8B98A5;
--amber:#F5A524;--teal:#2DD4BF;--coral:#F06A5D;--violet:#8B7CF6;--sky:#7DD3FC;
--mono:ui-monospace,'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;
--sans:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
*{box-sizing:border-box;margin:0}
body{background:var(--ink);color:var(--txt);font-family:var(--sans);padding:28px 20px 60px}
.wrap{max-width:960px;margin:0 auto}
header h1{font-size:15px;letter-spacing:.22em;text-transform:uppercase;color:var(--dim);font-weight:600}
header .proj{font-family:var(--mono);font-size:30px;margin-top:6px}
.totals{display:flex;flex-wrap:wrap;gap:28px;margin:22px 0 34px;padding:16px 18px;
 background:var(--panel);border:1px solid var(--line);border-radius:10px}
.tot b{display:block;font-family:var(--mono);font-size:22px}
.tot span{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim)}
.tot .amber{color:var(--amber)} .tot .teal{color:var(--teal)} .tot .coral{color:var(--coral)}
/* the rail — four-tier git spine */
.rail{position:relative;padding-left:26px}
.rail:before{content:"";position:absolute;left:7px;top:0;bottom:0;width:2px;
 background:linear-gradient(var(--violet),var(--line))}
.epic{position:relative;background:var(--panel);border:1px solid var(--line);
 border-radius:10px;padding:16px 18px;margin-bottom:18px}
.epic:before{content:"";position:absolute;left:-26px;top:24px;width:14px;height:14px;
 border-radius:50%;background:var(--node);border:3px solid var(--ink)}
.epic:after{content:"";position:absolute;left:-12px;top:30px;width:12px;height:2px;background:var(--line)}
.ehead{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:baseline}
.eid{font-family:var(--mono);color:var(--dim);font-size:13px}
.etitle{font-size:17px;font-weight:600}
.wsjf{font-family:var(--mono);font-size:12px;color:var(--dim)}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 12px}
.chip{font-family:var(--mono);font-size:11px;padding:2px 8px;border-radius:99px;
 border:1px solid var(--line);color:var(--dim)}
.chip i{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px}
.bar{height:8px;border-radius:99px;background:#1A222D;overflow:hidden;display:flex}
.bar div{height:100%}
.row{display:flex;justify-content:space-between;align-items:baseline;margin-top:12px;gap:10px;flex-wrap:wrap}
.cost{font-family:var(--mono);font-size:13px}
.cost b{color:var(--amber);font-size:16px}
.budget{flex:1;min-width:140px;height:5px;background:#1A222D;border-radius:99px;overflow:hidden}
.budget div{height:100%;background:var(--amber)}
.budget.over div{background:var(--coral)}
.models{font-family:var(--mono);font-size:11px;color:var(--dim);margin-top:8px}
.task-table{width:100%;border-collapse:collapse;margin-top:14px;font-family:var(--mono);font-size:11px}
.task-table th,.task-table td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:left}
.task-table th{color:var(--dim);font-weight:500}
.task-table td.r,.task-table th.r{text-align:right}
.task-table tr.missing td{color:var(--amber)}
.task-table tr.no-data td{color:var(--dim)}
.task-table tr.run-detail-row td{padding:0 8px 10px;border-bottom:1px solid var(--line)}
.run-details{background:#0F151D;border:1px solid var(--line);border-radius:8px;margin:2px 0 6px;padding:8px}
.run-details summary{cursor:pointer;color:var(--sky)}
.run-table{margin-top:8px;font-size:10px}
.run-table th,.run-table td{padding:5px 6px;white-space:nowrap}
.session{display:inline-block;max-width:92px;overflow:hidden;text-overflow:ellipsis;vertical-align:bottom}
.usage-ok{color:var(--teal)} .usage-warn{color:var(--amber)}
table{width:100%;border-collapse:collapse;margin-top:30px;font-family:var(--mono);font-size:13px}
caption{text-align:left;font-family:var(--sans);font-size:11px;letter-spacing:.18em;
 text-transform:uppercase;color:var(--dim);padding-bottom:10px}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left}
td.r,th.r{text-align:right}
footer{margin-top:34px;color:var(--dim);font-size:12px;font-family:var(--mono)}
@media(max-width:560px){.totals{gap:16px}.tot b{font-size:18px}}
</style></head><body><div class="wrap">
<header><h1>the harness · mission console</h1><div class="proj">@@PROJECT@@</div></header>
<section class="totals">
 <div class="tot"><b class="amber">$@@COST@@</b><span>total cost</span></div>
 <div class="tot"><b>@@TOKENS@@</b><span>total tokens</span></div>
 <div class="tot"><b class="teal">@@DONE@@/@@TASKS@@</b><span>tasks done</span></div>
 <div class="tot"><b class="coral">@@BUGS@@</b><span>open bugs</span></div>
 <div class="tot"><b>@@EPICS@@</b><span>epics</span></div>
</section>
<section class="rail">@@EPICS_HTML@@</section>
@@MODEL_TABLE@@
<footer>generated @@TS@@ · main ◂ development ◂ epic_&lt;NN&gt; ◂ epic_&lt;NN&gt;_task_&lt;MM&gt; · build: agent/orchestrator/dashboard_build.py</footer>
</div></body></html>"""


def kfmt(n):
    return f"{n/1_000_000:.2f}M" if n >= 1_000_000 else (f"{n/1000:.1f}k" if n >= 1000 else f"{int(n)}")


def money(d):
    actual = fnum(d.get("actual_cost_usd"))
    estimated = fnum(d.get("estimated_cost_usd"))
    if actual:
        return f"${actual:.2f}"
    if estimated:
        return f"~${estimated:.2f}"
    return "—"


def seconds(v):
    n = fnum(v)
    return f"{n:.1f}s" if n else "—"


def run_details_html(task):
    details = task.get("run_details") or []
    if not details:
        return ""
    rows = []
    for run in details:
        rows.append(
            "<tr><td>{ts}</td><td>{platform}</td><td>{model}</td>"
            "<td class='r'>{input}</td><td class='r'>{output}</td>"
            "<td class='r'>{cache_read}</td><td class='r'>{cache_creation}</td>"
            "<td class='r'>{tokens}</td><td class='r'>{cost}</td>"
            "<td class='r'>{duration}</td><td><span class='session' title='{session_title}'>{session}</span></td></tr>".format(
                ts=html.escape(str(run.get("ts") or "—")),
                platform=html.escape(str(run.get("platform") or "—")),
                model=html.escape(str(run.get("model") or "—")),
                input=kfmt(fnum(run.get("input"))),
                output=kfmt(fnum(run.get("output"))),
                cache_read=kfmt(fnum(run.get("cache_read"))),
                cache_creation=kfmt(fnum(run.get("cache_creation"))),
                tokens=kfmt(fnum(run.get("tokens"))),
                cost=money(run),
                duration=seconds(run.get("duration_s")),
                session_title=html.escape(str(run.get("session_id") or "")),
                session=html.escape(str(run.get("session_id") or "—")),
            )
        )
    table = ("<table class='run-table'><tr><th>time</th><th>platform</th><th>model</th>"
             "<th class='r'>input</th><th class='r'>output</th><th class='r'>cache-r</th>"
             "<th class='r'>cache-w</th><th class='r'>total</th><th class='r'>cost</th>"
             "<th class='r'>dur</th><th>session</th></tr>" + "".join(rows) + "</table>")
    return ("<tr class='run-detail-row'><td colspan='7'><details class='run-details'>"
            f"<summary>{len(details)} run detail{'s' if len(details) != 1 else ''}</summary>"
            f"{table}</details></td></tr>")


def task_usage_html(tasks):
    if not tasks:
        return ""
    rows = []
    for t in sorted(tasks, key=lambda row: row["key"]):
        tokens = fnum(t.get("tokens"))
        total_cost = fnum(t.get("actual_cost_usd")) + fnum(t.get("estimated_cost_usd"))
        cost_prefix = "~" if fnum(t.get("estimated_cost_usd")) and not fnum(t.get("actual_cost_usd")) else ""
        missing = bool(t.get("missing_usage"))
        status = str(t.get("status") or "untracked")
        css = "missing" if missing else ("no-data" if tokens == 0 else "")
        usage = "missing" if missing else ("no rows" if t.get("runs", 0) == 0 else "ok")
        usage_cls = "usage-warn" if missing or t.get("missing_usage_runs") else "usage-ok"
        rows.append(
            "<tr class='{css}'><td>{task}</td><td>{status}</td><td>{estimate}</td>"
            "<td class='r'>{runs}</td><td class='r'>{tokens}</td><td class='r'>{cost}</td>"
            "<td class='{usage_cls}'>{usage}</td></tr>".format(
                css=css,
                task=html.escape(str(t["key"])),
                status=html.escape(status),
                estimate=html.escape(str(t.get("estimate") or "")),
                runs=int(t.get("runs") or 0),
                tokens=kfmt(tokens),
                cost=f"{cost_prefix}${total_cost:.2f}",
                usage_cls=usage_cls,
                usage=html.escape(str(usage)),
            )
        )
        rows.append(run_details_html(t))
    return ("<table class='task-table'><tr><th>task</th><th>status</th><th>estimate</th>"
            "<th class='r'>runs</th><th class='r'>tokens</th><th class='r'>cost</th>"
            "<th>usage</th></tr>" + "".join(rows) + "</table>")


def epic_html(e, warn):
    total = sum(e["counts"].values())
    seg = "".join(f'<div style="width:{100*e["counts"][s]/total if total else 0:.2f}%;background:{COLORS[s]}"></div>'
                  for s in STATUS_ORDER if e["counts"].get(s))
    chips = "".join(f'<span class="chip"><i style="background:{COLORS[s]}"></i>{s} {e["counts"][s]}</span>'
                    for s in STATUS_ORDER if e["counts"].get(s))
    if e["bugs"]:
        chips += f'<span class="chip"><i style="background:{COLORS["blocked"]}"></i>bugs {e["bugs"]}</span>'
    node = COLORS["done"] if e["status"] in ("done", "verified") else \
        (COLORS["in-progress"] if any(e["counts"][s] for s in ("in-progress", "review-requested", "changes-requested")) else COLORS["todo"])
    pct = min(100.0, 100.0 * e["cost"] / warn) if warn else 0
    over = " over" if e["cost"] > warn else ""
    models = " · ".join(f"{m} ${c:.2f}" for m, c in sorted(e["models"].items(), key=lambda x: -x[1])) or "—"
    wsjf = f'<span class="wsjf">WSJF {html.escape(str(e["wsjf"]))}</span>' if e["wsjf"] != "" else ""
    return f"""<article class="epic" style="--node:{node}">
<div class="ehead"><div><span class="eid">{html.escape(e["id"])}</span>
 <span class="etitle">{html.escape(str(e["title"]))}</span></div>{wsjf}</div>
<div class="chips">{chips or '<span class="chip">no tasks yet</span>'}</div>
<div class="bar">{seg}</div>
<div class="row"><span class="cost"><b>${e["cost"]:.2f}</b> / ${warn:.0f} budget · {kfmt(e["tokens"])} tok</span>
<span class="budget{over}"><div style="width:{pct:.1f}%"></div></span></div>
<div class="models">{html.escape(models)}</div>{task_usage_html(e.get("tasks", []))}</article>"""


def main():
    project, warn, epics = load()
    cost = sum(e["cost"] for e in epics)
    toks = sum(e["tokens"] for e in epics)
    done = sum((e["counts"]["done"]) + e["counts"]["verified"] for e in epics)
    tasks = sum(sum(e["counts"].values()) for e in epics)
    bugs = sum(e["bugs"] for e in epics)
    agg = {}
    for e in epics:
        for m, c in e["models"].items():
            agg[m] = agg.get(m, 0.0) + c
    if agg:
        rows = "".join(f"<tr><td>{html.escape(m)}</td><td class='r'>${c:.2f}</td>"
                       f"<td class='r'>{(100*c/cost if cost else 0):.0f}%</td></tr>"
                       for m, c in sorted(agg.items(), key=lambda x: -x[1]))
        table = (f"<table><caption>spend by model</caption><tr><th>model</th>"
                 f"<th class='r'>cost</th><th class='r'>share</th></tr>{rows}</table>")
    else:
        table = ""
    page = (PAGE.replace("@@PROJECT@@", html.escape(str(project)))
            .replace("@@COST@@", f"{cost:.2f}").replace("@@TOKENS@@", kfmt(toks))
            .replace("@@DONE@@", str(done)).replace("@@TASKS@@", str(tasks))
            .replace("@@BUGS@@", str(bugs)).replace("@@EPICS@@", str(len(epics)))
            .replace("@@EPICS_HTML@@", "".join(epic_html(e, warn) for e in epics) or "<p>No epics yet — run /epic-breakdown.</p>")
            .replace("@@MODEL_TABLE@@", table)
            .replace("@@TS@@", datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%MZ")))
    out = os.path.join(ROOT, "dashboard", "index.html")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w", encoding="utf-8").write(page)
    print(f"harness: dashboard → {os.path.relpath(out, ROOT)} "
          f"(${cost:.2f}, {len(epics)} epics, {tasks} tasks)")


if __name__ == "__main__":
    main()
