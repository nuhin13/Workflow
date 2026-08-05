-- 0002_access_workshop · UP
--
-- The access schema (E01-T02, NFR-SEC-01, ADR-0005, ADR-0007). Accounts,
-- workshops, memberships, application sessions and owner-PIN state, with
-- row-level security as the second layer of tenant isolation behind the
-- application repository (conventions.md §4 "Read authorization").
--
-- Executed only by scripts/migrate-diagnostic.sh, never at application
-- startup, and only after explicit human review of this diff
-- (constitution rule 4).

BEGIN;

-- ── accounts ────────────────────────────────────────────────────────────────
-- NOT workshop-scoped: an account exists before it has a workshop, and is
-- reachable only by account id from an authenticated path. No RLS here.
CREATE TABLE IF NOT EXISTS accounts (
    account_id    uuid        PRIMARY KEY,
    -- One-way digest of the verified phone number. A database dump must never
    -- yield a phone number (EARS-E01-T02-2).
    phone_digest  text        NOT NULL UNIQUE,
    created_at    timestamptz NOT NULL,
    disabled_at   timestamptz
);

COMMENT ON TABLE accounts IS
    'E01 access account. phone_digest is a one-way verifier; the raw phone number is never stored.';

-- ── workshops ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workshops (
    workshop_id         uuid        PRIMARY KEY,
    name                text        NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 120),
    -- Fixed to 'BD' by the domain (BRD scope); the check keeps a future
    -- region rollout an explicit migration rather than a silent value drift.
    region_profile      text        NOT NULL DEFAULT 'BD' CHECK (region_profile = 'BD'),
    locale              text        NOT NULL DEFAULT 'bn' CHECK (locale IN ('bn', 'en')),
    created_at          timestamptz NOT NULL,
    setup_completed_at  timestamptz
);

COMMENT ON TABLE workshops IS
    'E01 workshop tenant. Every other product table hangs off workshop_id.';

-- ── workshop_vehicle_types ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workshop_vehicle_types (
    workshop_id   uuid NOT NULL REFERENCES workshops ON DELETE CASCADE,
    vehicle_type  text NOT NULL,
    PRIMARY KEY (workshop_id, vehicle_type)
);

COMMENT ON TABLE workshop_vehicle_types IS
    'Approved vehicle-type selections made during workshop setup (SCR-001).';

-- ── memberships ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memberships (
    membership_id  uuid        PRIMARY KEY,
    account_id     uuid        NOT NULL REFERENCES accounts ON DELETE CASCADE,
    workshop_id    uuid        NOT NULL REFERENCES workshops ON DELETE CASCADE,
    role           text        NOT NULL CHECK (role IN ('owner', 'staff')),
    created_at     timestamptz NOT NULL,
    revoked_at     timestamptz,
    UNIQUE (account_id, workshop_id)
);

CREATE INDEX IF NOT EXISTS memberships_workshop_id_idx ON memberships (workshop_id);
CREATE INDEX IF NOT EXISTS memberships_account_id_idx ON memberships (account_id);

COMMENT ON TABLE memberships IS
    'Which account may act on which workshop, and with what role.';

-- ── application_sessions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS application_sessions (
    session_id    uuid        PRIMARY KEY,
    -- One-way digest of the presented bearer token; the raw token is never
    -- stored server-side (EARS-E01-T02-2, Q-007).
    token_digest  text        NOT NULL UNIQUE,
    account_id    uuid        NOT NULL REFERENCES accounts ON DELETE CASCADE,
    -- Nullable: a signed-in account with no workshop yet (first-time owner
    -- before setup) is a real, representable state, not an error.
    workshop_id   uuid        REFERENCES workshops ON DELETE CASCADE,
    issued_at     timestamptz NOT NULL,
    expires_at    timestamptz NOT NULL,
    revoked_at    timestamptz
);

CREATE INDEX IF NOT EXISTS application_sessions_workshop_id_idx ON application_sessions (workshop_id);
CREATE INDEX IF NOT EXISTS application_sessions_account_id_idx ON application_sessions (account_id);

COMMENT ON TABLE application_sessions IS
    'Garazo-owned application session. token_digest is a one-way verifier (Q-007).';

-- ── owner_pin_credentials ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS owner_pin_credentials (
    workshop_id  uuid        PRIMARY KEY REFERENCES workshops ON DELETE CASCADE,
    -- One-way, salted Argon2id verifier (Q-007). Never the raw PIN.
    pin_digest   text        NOT NULL,
    updated_at   timestamptz NOT NULL
);

COMMENT ON TABLE owner_pin_credentials IS
    'Argon2id verifier for the workshop owner PIN. Never the raw PIN (EARS-E01-T02-2).';

-- ── owner_pin_failure_states ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS owner_pin_failure_states (
    workshop_id           uuid        PRIMARY KEY REFERENCES workshops ON DELETE CASCADE,
    consecutive_failures  smallint    NOT NULL DEFAULT 0 CHECK (consecutive_failures >= 0),
    completed_cycles      smallint    NOT NULL DEFAULT 0 CHECK (completed_cycles >= 0),
    cooldown_until        timestamptz,
    updated_at            timestamptz NOT NULL
);

COMMENT ON TABLE owner_pin_failure_states IS
    'Q-005 escalation state (60/120/240s). Stored, not derived, so a restart cannot reset an attacker''s budget.';

-- ── owner_money_grants ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS owner_money_grants (
    grant_id      uuid        PRIMARY KEY,
    -- One-way digest of the presented grant token. Never the raw token.
    token_digest  text        NOT NULL UNIQUE,
    -- ON DELETE CASCADE: revoking a session revokes every money grant it
    -- issued. A grant outliving its session is the shared-phone leak this
    -- product must not have (EARS-E01-T02-3).
    session_id    uuid        NOT NULL REFERENCES application_sessions ON DELETE CASCADE,
    workshop_id   uuid        NOT NULL REFERENCES workshops ON DELETE CASCADE,
    issued_at     timestamptz NOT NULL,
    expires_at    timestamptz NOT NULL,
    revoked_at    timestamptz
);

CREATE INDEX IF NOT EXISTS owner_money_grants_workshop_id_idx ON owner_money_grants (workshop_id);
CREATE INDEX IF NOT EXISTS owner_money_grants_session_id_idx ON owner_money_grants (session_id);

COMMENT ON TABLE owner_money_grants IS
    'Short-lived owner-money grant. Cascades from application_sessions so a revoked session cannot leave a usable grant.';

-- ── application role (RLS proof) ─────────────────────────────────────────────
-- `POSTGRES_USER` (compose: garazo) is the cluster superuser and, like every
-- table owner, ALWAYS bypasses row-level security regardless of policy — a
-- connection using it can never prove isolation. A distinct, non-superuser,
-- non-owner role is required so the isolation suite tests what production
-- actually relies on, not a superuser connection that would pass even with
-- RLS mistakenly disabled.
--
-- The password below is a fixed, local-only placeholder — identical in every
-- checkout and worthless to an attacker, exactly like POSTGRES_PASSWORD in
-- infra/compose/compose.development.yaml. It is NOT a production credential;
-- see infra/db/README.md for the production rotation note.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'garazo_app') THEN
        CREATE ROLE garazo_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT
            PASSWORD 'garazo-app-local-dev';
    END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO garazo_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON
    accounts,
    workshops,
    workshop_vehicle_types,
    memberships,
    application_sessions,
    owner_pin_credentials,
    owner_pin_failure_states,
    owner_money_grants
TO garazo_app;

-- ── row-level security ───────────────────────────────────────────────────────
-- Every policy compares the row's workshop_id to the transaction-local
-- setting `garazo.workshop_id`, set ONLY by the server from a resolved scope
-- (never from request input) via `withTenantScope` (set_config(..., true) —
-- the trailing `true` is what keeps this transaction-local instead of leaking
-- across a pooled connection).
--
-- `workshops`, `workshop_vehicle_types`, `memberships` and
-- `application_sessions` also accept the transaction-local flag
-- `garazo.bootstrap`. Two, and only two, adapter operations legitimately run
-- before a workshop scope can exist: creating the very first account +
-- workshop + membership (there is no workshop to scope to until this
-- transaction creates one), and resolving a session by its token digest
-- (the token digest IS the proof — a unique-indexed lookup that returns at
-- most one row — and is exactly what tells the server which workshop scope
-- to set next). `garazo.bootstrap` is set only by those two adapter methods,
-- never from client input, so this does not weaken isolation for any other
-- read or write path. This is a deviation beyond the literal §6 policy
-- description; see the task file's Open Questions/Deviations section.
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops FORCE ROW LEVEL SECURITY;
CREATE POLICY workshops_tenant_isolation ON workshops
    USING (
        workshop_id::text = current_setting('garazo.workshop_id', true)
        OR current_setting('garazo.bootstrap', true) = 'true'
    )
    WITH CHECK (
        workshop_id::text = current_setting('garazo.workshop_id', true)
        OR current_setting('garazo.bootstrap', true) = 'true'
    );

ALTER TABLE workshop_vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_vehicle_types FORCE ROW LEVEL SECURITY;
CREATE POLICY workshop_vehicle_types_tenant_isolation ON workshop_vehicle_types
    USING (
        workshop_id::text = current_setting('garazo.workshop_id', true)
        OR current_setting('garazo.bootstrap', true) = 'true'
    )
    WITH CHECK (
        workshop_id::text = current_setting('garazo.workshop_id', true)
        OR current_setting('garazo.bootstrap', true) = 'true'
    );

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;
CREATE POLICY memberships_tenant_isolation ON memberships
    USING (
        workshop_id::text = current_setting('garazo.workshop_id', true)
        OR current_setting('garazo.bootstrap', true) = 'true'
    )
    WITH CHECK (
        workshop_id::text = current_setting('garazo.workshop_id', true)
        OR current_setting('garazo.bootstrap', true) = 'true'
    );

ALTER TABLE application_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_sessions FORCE ROW LEVEL SECURITY;
CREATE POLICY application_sessions_tenant_isolation ON application_sessions
    USING (
        workshop_id::text = current_setting('garazo.workshop_id', true)
        OR current_setting('garazo.bootstrap', true) = 'true'
    )
    WITH CHECK (
        workshop_id::text = current_setting('garazo.workshop_id', true)
        OR current_setting('garazo.bootstrap', true) = 'true'
    );

-- The remaining three tables are written only once a workshop scope already
-- exists (PIN setup/verification/failure accounting all require a resolved
-- workshop), so their policies are the plain comparison with no bootstrap
-- escape hatch.
ALTER TABLE owner_pin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_pin_credentials FORCE ROW LEVEL SECURITY;
CREATE POLICY owner_pin_credentials_tenant_isolation ON owner_pin_credentials
    USING (workshop_id::text = current_setting('garazo.workshop_id', true))
    WITH CHECK (workshop_id::text = current_setting('garazo.workshop_id', true));

ALTER TABLE owner_pin_failure_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_pin_failure_states FORCE ROW LEVEL SECURITY;
CREATE POLICY owner_pin_failure_states_tenant_isolation ON owner_pin_failure_states
    USING (workshop_id::text = current_setting('garazo.workshop_id', true))
    WITH CHECK (workshop_id::text = current_setting('garazo.workshop_id', true));

ALTER TABLE owner_money_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_money_grants FORCE ROW LEVEL SECURITY;
CREATE POLICY owner_money_grants_tenant_isolation ON owner_money_grants
    USING (workshop_id::text = current_setting('garazo.workshop_id', true))
    WITH CHECK (workshop_id::text = current_setting('garazo.workshop_id', true));

-- Deliberately NO seed rows. Setup is E01-T04's behaviour.

COMMIT;
