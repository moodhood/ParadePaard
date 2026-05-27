-- Baseline schema for the planning-service.
--
-- This migration is intended for FRESH databases only. Existing databases
-- (built previously by Hibernate ddl-auto) are baselined at version 1 via
-- spring.flyway.baseline-on-migrate, so this script is NOT executed against
-- them. The transformation logic that brings an older "events" schema up to
-- date lives in V2.
--
-- Column names follow Spring Boot's default physical naming strategy
-- (CamelCaseToUnderscoresNamingStrategy), matching what Hibernate expects.

CREATE TABLE IF NOT EXISTS projects (
    project_id           UUID         NOT NULL,
    name                 VARCHAR(255) NOT NULL,
    start_date           DATE         NOT NULL,
    end_date             DATE         NOT NULL,
    company_id           UUID         NOT NULL,
    client_company_id    UUID,
    internal_description VARCHAR(2000),
    external_description VARCHAR(4000),
    default_start_time   TIME,
    default_end_time     TIME,
    project_timezone     VARCHAR(100) NOT NULL DEFAULT 'UTC',
    location             VARCHAR(255),
    status               VARCHAR(20),
    created_by_user_id   UUID,
    created_at           TIMESTAMP,
    updated_at           TIMESTAMP,
    finalized            BOOLEAN      NOT NULL DEFAULT FALSE,
    finalized_at         TIMESTAMP,
    CONSTRAINT pk_projects PRIMARY KEY (project_id)
);

CREATE INDEX IF NOT EXISTS idx_project_company
    ON projects (company_id);
CREATE INDEX IF NOT EXISTS idx_project_date_range
    ON projects (start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_project_company_date_range
    ON projects (company_id, start_date, end_date);

CREATE TABLE IF NOT EXISTS shifts (
    shift_id      UUID         NOT NULL,
    project_id    UUID         NOT NULL,
    start_time    TIMESTAMP    NOT NULL,
    end_time      TIMESTAMP    NOT NULL,
    name          VARCHAR(255),
    break_minutes INTEGER,
    location      VARCHAR(255),
    people_needed INTEGER,
    function_name VARCHAR(255) NOT NULL,
    CONSTRAINT pk_shifts PRIMARY KEY (shift_id)
);

CREATE INDEX IF NOT EXISTS idx_shift_project
    ON shifts (project_id);
CREATE INDEX IF NOT EXISTS idx_shift_start_time
    ON shifts (start_time);
CREATE INDEX IF NOT EXISTS idx_shift_project_start_end
    ON shifts (project_id, start_time, end_time);

CREATE TABLE IF NOT EXISTS schedule_entries (
    schedule_entry_id     UUID        NOT NULL,
    shift_id              UUID        NOT NULL,
    user_id               UUID        NOT NULL,
    status                VARCHAR(20) NOT NULL,
    timesheet_exported    BOOLEAN     NOT NULL DEFAULT FALSE,
    timesheet_exported_at TIMESTAMP,
    CONSTRAINT pk_schedule_entries PRIMARY KEY (schedule_entry_id),
    CONSTRAINT uq_schedule_entry_shift_user UNIQUE (shift_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_schedule_shift
    ON schedule_entries (shift_id);
CREATE INDEX IF NOT EXISTS idx_schedule_status
    ON schedule_entries (status);
CREATE INDEX IF NOT EXISTS idx_schedule_shift_status
    ON schedule_entries (shift_id, status);

CREATE TABLE IF NOT EXISTS planning_client_companies (
    client_company_id   UUID         NOT NULL,
    owner_company_id    UUID         NOT NULL,
    name                VARCHAR(255) NOT NULL,
    address             VARCHAR(255),
    company_line        VARCHAR(255),
    notes               VARCHAR(4000),
    profile_picture_url TEXT,
    created_at          TIMESTAMP    NOT NULL,
    CONSTRAINT pk_planning_client_companies PRIMARY KEY (client_company_id)
);

CREATE INDEX IF NOT EXISTS idx_planning_client_owner
    ON planning_client_companies (owner_company_id);
CREATE INDEX IF NOT EXISTS idx_planning_client_name
    ON planning_client_companies (name);

CREATE TABLE IF NOT EXISTS planning_client_company_contacts (
    client_company_id UUID    NOT NULL,
    contact_order     INTEGER NOT NULL,
    first_name        VARCHAR(255),
    last_name         VARCHAR(255),
    position          VARCHAR(255),
    email             VARCHAR(255),
    phone             VARCHAR(255),
    CONSTRAINT pk_planning_client_company_contacts PRIMARY KEY (client_company_id, contact_order),
    CONSTRAINT fk_client_company_contacts_company FOREIGN KEY (client_company_id)
        REFERENCES planning_client_companies (client_company_id)
);

CREATE TABLE IF NOT EXISTS travel_claims (
    travel_claim_id     UUID          NOT NULL,
    schedule_entry_id   UUID          NOT NULL,
    kilometers          NUMERIC(19, 2) NOT NULL,
    rate_per_kilometer  NUMERIC(19, 2) NOT NULL,
    total_amount        NUMERIC(19, 2) NOT NULL,
    status              VARCHAR(20)   NOT NULL,
    rejection_note      VARCHAR(2000),
    submitted_at        TIMESTAMP,
    reviewed_at         TIMESTAMP,
    reviewed_by_user_id UUID,
    proof_image         BYTEA,
    proof_content_type  VARCHAR(255),
    CONSTRAINT pk_travel_claims PRIMARY KEY (travel_claim_id),
    CONSTRAINT uq_travel_claim_schedule_entry UNIQUE (schedule_entry_id)
);

CREATE INDEX IF NOT EXISTS idx_travel_claim_schedule_entry
    ON travel_claims (schedule_entry_id);
CREATE INDEX IF NOT EXISTS idx_travel_claim_status
    ON travel_claims (status);
