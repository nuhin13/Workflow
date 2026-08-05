# System map

What exists after E00, and where the boundaries are.

## Runtime shape

```mermaid
flowchart TB
  subgraph clients["Clients"]
    mobile["Flutter owner app<br/>apps/mobile"]
    admin["Next.js admin<br/>apps/admin"]
  end

  subgraph vm["Application VM — Docker Compose (ADR-0006)"]
    api["NestJS API<br/>apps/api"]
    worker["NestJS worker<br/>apps/worker<br/>separately runnable"]
  end

  subgraph managed["Managed services — OUTSIDE the VM"]
    pg[("PostgreSQL<br/>authoritative records")]
    objects[("Private object storage<br/>media · not yet used")]
  end

  subgraph providers["Providers — ports only, no adapter yet"]
    firebase["Phone identity<br/>E01"]
    sms["SMS sender<br/>E04"]
  end

  mobile -->|"generated Dart client"| api
  admin -->|"generated TS client"| api
  api --> pg
  worker --> pg
  api -.->|ObjectStoragePort| objects
  api -.->|PhoneIdentityPort| firebase
  worker -.->|SmsSenderPort| sms

  api -.-|"never imports"| worker
```

Dotted lines are boundaries that exist as **ports** with no adapter behind them
yet. Solid lines work today.

The database sits outside the VM deliberately: the VM is an accepted shared
failure domain, and a workshop's money records must survive losing it.

## The walking skeleton, end to end

```mermaid
sequenceDiagram
  actor human as Developer
  participant ui as SystemProbePage
  participant vm as SystemProbeViewModel
  participant client as Generated Dart client
  participant ctl as SystemController
  participant uc as RunSystemProbeUseCase
  participant repo as PostgresSystemProbeRepository
  participant db as PostgreSQL

  human->>ui: tap "Run persistence check"
  ui->>vm: run()
  vm->>vm: state = loading (button disabled)
  vm->>client: systemWalkingSkeleton({})
  client->>ctl: POST /api/v1/system/walking-skeleton
  ctl->>ctl: environment gate BEFORE body validation
  ctl->>uc: execute(context)
  uc->>repo: increment()
  repo->>db: INSERT … ON CONFLICT DO UPDATE … RETURNING
  db-->>repo: committed visit_count
  repo-->>uc: record
  uc->>uc: reject non-positive or unsafe integer
  uc-->>ctl: persisted + count
  ctl-->>client: 200 {status, visitCount, correlationId}
  client-->>vm: result
  vm->>ui: state = success
  ui-->>human: "Persisted. Visit count: N"
```

The gate runs **before** body validation on purpose: validating first would let
a caller tell a disabled route from a nonexistent one by the error it gets back.

## Layers and what may depend on what

```mermaid
flowchart LR
  subgraph transport["Transport"]
    controllers["Controllers · middleware · error filter"]
  end
  subgraph domain["Domain — provider-free"]
    usecases["Use cases"]
    ports["Ports · access types"]
  end
  subgraph adapters["Adapter edges — may import a driver"]
    pgadapter["postgres-*.ts · *.check.ts · composition roots"]
  end

  controllers --> usecases
  usecases --> ports
  pgadapter -.implements.-> ports
  controllers -.wires.-> pgadapter

  domain -->|"NEVER imports a provider SDK"| adapters
```

`tests/architecture/module-boundaries.spec.ts` enforces this and keeps an
**enumerated** list of files allowed to import a driver, so the exemption cannot
spread one "just this once" at a time.

## Trust boundaries

| Boundary | Rule |
|---|---|
| Client → API | Nothing a client sends is authority. A workshop id in a request is data (NFR-SEC-01). |
| API → domain | Only server-resolved context crosses. `anonymous`/`none`/`locked` are first-class states. |
| Domain → provider | Ports only. No SDK type reaches domain code. |
| Any → logs | Redaction by substring, failing closed — including owner-PIN-protected money. |
| Production → diagnostic | Four independent guards; see `docs/security/baseline.md`. |

## What E00 does NOT contain

No authentication, workshop, customer, vehicle, job, bill, due, reminder,
inventory, admin or reporting behaviour. No product table. No provider adapter.
The only database table is a diagnostic counter, and its primary key is
constrained so it cannot quietly become anything else.
