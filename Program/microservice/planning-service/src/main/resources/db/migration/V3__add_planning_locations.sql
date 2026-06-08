CREATE TABLE IF NOT EXISTS planning_locations (
    location_id       UUID         NOT NULL,
    owner_company_id  UUID         NOT NULL,
    name              VARCHAR(255) NOT NULL,
    address           VARCHAR(255),
    notes             VARCHAR(2000),
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_planning_locations PRIMARY KEY (location_id)
);

CREATE INDEX IF NOT EXISTS idx_planning_location_owner
    ON planning_locations (owner_company_id);

CREATE INDEX IF NOT EXISTS idx_planning_location_owner_name
    ON planning_locations (owner_company_id, name);

CREATE TABLE IF NOT EXISTS planning_client_location_usage (
    usage_id          UUID         NOT NULL,
    client_company_id UUID         NOT NULL,
    location_id       UUID         NOT NULL,
    last_used_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_planning_client_location_usage PRIMARY KEY (usage_id)
);

CREATE INDEX IF NOT EXISTS idx_planning_location_usage_client
    ON planning_client_location_usage (client_company_id);

CREATE INDEX IF NOT EXISTS idx_planning_location_usage_location
    ON planning_client_location_usage (location_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_planning_location_usage_client_location
    ON planning_client_location_usage (client_company_id, location_id);
