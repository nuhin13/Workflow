# EP-00 — Project Skeleton

- Traces from: Tech plan, ADRs, Design system
- Status: specced | building | qa | checkpoint | done
- Runnable flow when done: repo boots from clean clone with documented commands; one
  walking-skeleton request travels UI → API → data and back; CI runs lint + tests green.

EP-00 exists to make every later epic identical in shape. Anything two builders could do
two different ways gets decided HERE, once. `conventions.md` (§3 extracted to
`project/05-epics/EP-00-skeleton/conventions.md`) is quoted verbatim in every task spec.

## 1. Project structure
Full tree with a one-line purpose per directory — where EVERY kind of code goes:

```
src/
  <fill per tech plan — e.g. api/, domain/, ui/, db/, jobs/, config/>
tests/
  unit/  integration/  e2e/
```
Rules: where a new feature's files go, what gets its own module, what never goes where
(e.g. "no business logic in route handlers").

## 2. Toolchain
Language + version, package manager, lint/format config, test runner, build, run scripts,
CI pipeline definition. Exact commands: `install`, `dev`, `test`, `lint`, `build`.

## 3. Conventions (the identical-everywhere contract)
### Naming
- Files: … · Directories: … · Variables: … · Functions: … · Types/classes: …
- Constants: … · DB tables/columns: … · API routes: … · Events: … · Branches/commits: …
### Code patterns
- Error handling: (the one pattern; example snippet)
- Validation: where and how, once
- Logging: format, levels, what's mandatory
- State management / data access: the blessed pattern, with a do/don't example
- Dependency injection / module boundaries: …
### Design patterns
Which GoF/architectural patterns are blessed for which problem, and which are banned.
### UI patterns
Component file anatomy, styling approach (tokens only — no hardcoded colors/sizes),
folder-per-component or otherwise.
### Test patterns
Test file location + naming, arrange/act/assert style, fixture strategy, coverage floor.

## 4. Walking skeleton
The one thin end-to-end slice this epic implements to prove the architecture:
route → handler → domain → store → response → rendered UI. Describe it concretely.

## 5. Tasks
| ID | Task | Spec file | Depends on | Status |
|---|---|---|---|---|
| T-00.01 | Repo scaffold + toolchain | tasks/T-00.01.md | — | pending |
| T-00.02 | CI pipeline | tasks/T-00.02.md | T-00.01 | pending |
| T-00.03 | Walking skeleton slice | tasks/T-00.03.md | T-00.01 | pending |
| T-00.04 | conventions.md + example reference feature | tasks/T-00.04.md | T-00.03 | pending |

## 6. Open questions
| ID | Question | Blocks | Status |
|---|---|---|---|

## Handoff
