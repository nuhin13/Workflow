# Business Forecast — <Project Name>

- ID prefix: `FC-###`
- Traces from: BRD (`BR-###`) · Traces to: Tech plan (capacity/scale decisions), Features
- Last updated: YYYY-MM-DD

The forecast is a first-class asset: the tech plan MUST cite `FC-###` IDs when making
scale, cost, and capacity decisions. Guesses are fine — labeled as guesses with a
confidence level — silent assumptions are not.

## 1. Demand forecast
| ID | Metric | M+3 | M+6 | M+12 | Basis (evidence or guess) | Confidence |
|---|---|---|---|---|---|---|
| FC-001 | Total users | | | | | low/med/high |
| FC-002 | DAU | | | | | |
| FC-003 | Peak concurrent | | | | | |
| FC-004 | Data volume | | | | | |

## 2. Revenue / cost model (if applicable)
| ID | Item | Model | M+6 estimate | M+12 estimate | Confidence |
|---|---|---|---|---|---|

## 3. Growth scenarios
- **Conservative:** …
- **Expected:** … (tech plan designs for this)
- **Aggressive:** … (tech plan must state what breaks first and the upgrade path)

## 4. Forecast → engineering implications
| FC ID | Implication | Feeds decision |
|---|---|---|
| FC-003 | e.g. ~200 peak concurrent ⇒ single node + managed DB is fine for year 1 | ADR-### |

## 5. Review cadence
When and how the forecast gets revisited (e.g., each checkpoint, monthly).

## Handoff
