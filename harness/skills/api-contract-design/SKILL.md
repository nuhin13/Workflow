---
name: api-contract-design
description: Define OpenAPI-shaped request/response contracts inside task files - endpoints, schemas, status codes, pagination, validation. Use when sharding any task that touches an API, when frontend/backend must work in parallel, or when "what does this endpoint return" is unclear.
---
# API Contract Design

Contracts live IN the task file (`api_contracts:`) so one source of truth
drives backend impl, frontend consumption, and QA tests in parallel.

## Required fields per endpoint
```yaml
- endpoint: /api/v1/<resource>
  method: POST            # GET|POST|PUT|PATCH|DELETE
  auth: bearer | none | <scheme>
  request:
    content_type: application/json
    schema: { field: type (required|optional), ... }
  responses:
    200: { ...shape... }       # one entry per reachable status
    400: { error: string, fields?: {name: reason} }
    401: { error: string }
  pagination: none | cursor | offset | page+page_size   # lists MUST declare
  required_fields: [..]
  validation: ["rule per field, concrete", ...]
  idempotent: true|false       # for POST/PUT where it matters
```

## Rules
1. Lists ALWAYS declare pagination style + default/max page size + the
   envelope (`{data, next_cursor}` or `{data, page, total}`) — pick the
   genesis-decided style, never mix.
2. Error envelope is uniform project-wide (set in Epic 00); every endpoint
   lists its reachable error codes.
3. Naming/casing per genesis conventions (e.g. snake_case JSON) — contracts
   are where casing drift gets caught.
4. Breaking an existing contract = new task + human gate, never a silent edit.
5. QA derives at least one test per status code listed.
