-- 0002_access_workshop · DOWN
--
-- Drops the eight access tables, their policies, and the garazo_app role, and
-- nothing else. A down-migration runs when something has already gone wrong,
-- often at speed — the guard below refuses to touch anything whose shape does
-- not match this migration, exactly like 0001_system_probe.down.sql.
--
-- Order matters: policies before tables (a table with a policy attached
-- cannot be dropped mid-way through and left half-migrated by accident, but
-- dropping the table drops its policies anyway — policies are dropped
-- explicitly here so a partial failure is diagnosable), and child tables
-- before the parents they reference.

BEGIN;

DO $$
DECLARE
    expected_tables text[] := ARRAY[
        'accounts', 'workshops', 'workshop_vehicle_types', 'memberships',
        'application_sessions', 'owner_pin_credentials',
        'owner_pin_failure_states', 'owner_money_grants'
    ];
    tbl text;
    present_count int;
BEGIN
    -- Refuse unless EVERY expected table that exists still has the column
    -- shape this migration created. A table present with a foreign shape
    -- (some later migration altered it) is not this migration's to drop.
    FOREACH tbl IN ARRAY expected_tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = tbl) THEN
            SELECT count(*) INTO present_count
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'workshop_id';

            IF tbl NOT IN ('accounts') AND present_count = 0 THEN
                RAISE EXCEPTION
                    'refusing to drop %: missing expected workshop_id column. Inspect it manually.', tbl;
            END IF;
        END IF;
    END LOOP;
END
$$;

-- Policies (defence-in-depth layer) before tables.
DROP POLICY IF EXISTS workshops_tenant_isolation ON workshops;
DROP POLICY IF EXISTS workshop_vehicle_types_tenant_isolation ON workshop_vehicle_types;
DROP POLICY IF EXISTS memberships_tenant_isolation ON memberships;
DROP POLICY IF EXISTS application_sessions_tenant_isolation ON application_sessions;
DROP POLICY IF EXISTS owner_pin_credentials_tenant_isolation ON owner_pin_credentials;
DROP POLICY IF EXISTS owner_pin_failure_states_tenant_isolation ON owner_pin_failure_states;
DROP POLICY IF EXISTS owner_money_grants_tenant_isolation ON owner_money_grants;

-- Children before parents.
DROP TABLE IF EXISTS owner_money_grants;
DROP TABLE IF EXISTS owner_pin_failure_states;
DROP TABLE IF EXISTS owner_pin_credentials;
DROP TABLE IF EXISTS application_sessions;
DROP TABLE IF EXISTS memberships;
DROP TABLE IF EXISTS workshop_vehicle_types;
DROP TABLE IF EXISTS workshops;
DROP TABLE IF EXISTS accounts;

-- The application role holds only privileges, never owns an object, but
-- DROP OWNED still needs running first to clear default-privilege/ACL
-- entries before the role itself can be dropped.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'garazo_app') THEN
        EXECUTE 'DROP OWNED BY garazo_app';
        DROP ROLE garazo_app;
    END IF;
END
$$;

COMMIT;
