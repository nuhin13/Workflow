-- 0001_system_probe · DOWN
--
-- Drops the diagnostic table and nothing else. Safe to run: the table holds no
-- product data by construction.
--
-- The guard below is the point of this file. A down-migration is run when
-- something has already gone wrong, often at speed, and a typo'd target is how
-- a rollback destroys real data. This refuses to drop anything whose shape is
-- not the diagnostic table it expects.

BEGIN;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'system_probes')
    THEN
        -- Verify identity before destroying: exactly the three expected columns.
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'system_probes'
              AND column_name = 'probe_key'
        ) OR (
            SELECT count(*)
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'system_probes'
        ) <> 3
        THEN
            RAISE EXCEPTION
                'refusing to drop system_probes: shape does not match migration 0001. Inspect it manually.';
        END IF;

        DROP TABLE system_probes;
    END IF;
END
$$;

COMMIT;
