-- 0001_system_probe · UP
--
-- E00 diagnostic ONLY. This table exists to prove one real round trip from the
-- Flutter app through the API to PostgreSQL and back. It is not a product
-- table, it holds no workshop, customer, vehicle, job or money data, and it
-- must never grow into a generic metadata or settings table. If something
-- needs a new column here, it needs its own table in its own epic.
--
-- Executed only by scripts/migrate-diagnostic.sh, never at application startup.

BEGIN;

CREATE TABLE IF NOT EXISTS system_probes (
    -- Constrained to a single row's worth of key space. Without this check the
    -- table would quietly accept arbitrary keys and become the generic
    -- key-value store this comment warns against.
    probe_key    text        PRIMARY KEY CHECK (probe_key = 'walking-skeleton'),

    -- bigint because the diagnostic may be hammered by concurrency tests; a
    -- negative value would mean the atomic upsert is broken, so it is rejected.
    visit_count  bigint      NOT NULL CHECK (visit_count >= 0),

    updated_at   timestamptz NOT NULL
);

COMMENT ON TABLE system_probes IS
    'E00 walking-skeleton diagnostic only. Not product data. Safe to drop.';

-- Deliberately NO seed row. The upsert in the adapter must create it, so the
-- very first probe call exercises the insert path rather than only the update
-- path — otherwise a broken insert would never be discovered.

COMMIT;
