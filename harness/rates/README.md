# harness/rates/ — model price table

**Why this exists.** Budget warnings need prices. `cost-config.yaml`
maps model names to $/token so runs without reported cost still get an
estimate.

**How it works.** `metrics_report.py` and `dashboard_build.py` read it
to estimate cost when a run logged tokens but no `cost_usd`. Update the
numbers when providers change pricing; add aliases for new model ids.

**What it does NOT cover.** Billing truth — your provider invoice is the
authority. Estimates are marked with `~` everywhere they appear.
