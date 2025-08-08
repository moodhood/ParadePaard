/* ------------------------------------------------------------------
   CLEAR EXISTING DATA (For Development/Testing Only)
   ------------------------------------------------------------------ */
DROP TABLE IF EXISTS contract_functions CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS functions CASCADE;

/* ------------------------------------------------------------------
   TABLE DEFINITIONS
   ------------------------------------------------------------------ */
CREATE TABLE functions (
                           function_id UUID PRIMARY KEY,
                           function_name VARCHAR(255) NOT NULL,
                           hourly_wage NUMERIC(19,2) NOT NULL
);

CREATE TABLE contracts (
                           contract_id UUID PRIMARY KEY,
                           user_id UUID NOT NULL,
                           start_date DATE NOT NULL,
                           end_date DATE NOT NULL,
                           wage_tax_amount_test NUMERIC(19,2) NOT NULL
);

CREATE TABLE contract_functions (
                                    contract_id UUID NOT NULL REFERENCES contracts(contract_id),
                                    function_name VARCHAR(255) NOT NULL,
                                    PRIMARY KEY (contract_id, function_name)
);

/* ------------------------------------------------------------------
   FUNCTIONS DATA
   ------------------------------------------------------------------ */
-- Junior Developer
INSERT INTO functions (function_id, function_name, hourly_wage) VALUES
    ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Junior Developer', 25.00);

-- Senior Developer
INSERT INTO functions (function_id, function_name, hourly_wage) VALUES
    ('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Senior Developer', 45.00);

-- Project Manager
INSERT INTO functions (function_id, function_name, hourly_wage) VALUES
    ('ccccccc3-cccc-cccc-cccc-cccccccccccc', 'Project Manager', 60.00);

-- Tester
INSERT INTO functions (function_id, function_name, hourly_wage) VALUES
    ('ddddddd4-dddd-dddd-dddd-dddddddddddd', 'Tester', 30.00);

/* ------------------------------------------------------------------
   CONTRACTS DATA
   ------------------------------------------------------------------ */
-- Contract Alpha: full year 2025
INSERT INTO contracts (contract_id, user_id, start_date, end_date, wage_tax_amount_test) VALUES
    ('11111111-1111-1111-1111-111111111111', 'b1e2f3a4-2222-4c5d-9b3c-000000000010', '2025-01-01', '2025-12-31', 3000.00);

-- Contract Bravo: February through August
INSERT INTO contracts (contract_id, user_id, start_date, end_date, wage_tax_amount_test) VALUES
    ('22222222-2222-2222-2222-222222222222', 'c2f3e4b5-4444-4a1b-8c2d-000000000020', '2025-02-01', '2025-08-31', 1500.00);

-- Contract Charlie: mid March to mid September
INSERT INTO contracts (contract_id, user_id, start_date, end_date, wage_tax_amount_test) VALUES
    ('33333333-3333-3333-3333-333333333333', 'd3a4b5c6-6666-4d2e-1f3a-000000000030', '2025-03-15', '2025-09-14', 2500.00);

-- Contract Delta: April to October
INSERT INTO contracts (contract_id, user_id, start_date, end_date, wage_tax_amount_test) VALUES
    ('44444444-4444-4444-4444-444444444444', 'e4b5c6d7-8888-4c1f-2a3b-000000000040', '2025-04-10', '2025-10-09', 1800.00);

-- Contract Echo: May to November
INSERT INTO contracts (contract_id, user_id, start_date, end_date, wage_tax_amount_test) VALUES
    ('55555555-5555-5555-5555-555555555555', 'f5c6d7e8-aaaa-4e9b-1c2d-000000000050', '2025-05-01', '2025-11-30', 3200.00);

/* ------------------------------------------------------------------
   CONTRACT FUNCTIONS MAPPING
   ------------------------------------------------------------------ */
-- Contract Alpha Functions
INSERT INTO contract_functions (contract_id, function_name) VALUES
                                                                ('11111111-1111-1111-1111-111111111111', 'Project Manager'),
                                                                ('11111111-1111-1111-1111-111111111111', 'Senior Developer');

-- Contract Bravo Functions
INSERT INTO contract_functions (contract_id, function_name) VALUES
    ('22222222-2222-2222-2222-222222222222', 'Tester');

-- Contract Charlie Functions
INSERT INTO contract_functions (contract_id, function_name) VALUES
                                                                ('33333333-3333-3333-3333-333333333333', 'Junior Developer'),
                                                                ('33333333-3333-3333-3333-333333333333', 'Tester');

-- Contract Delta Functions
INSERT INTO contract_functions (contract_id, function_name) VALUES
    ('44444444-4444-4444-4444-444444444444', 'Senior Developer');

-- Contract Echo Functions
INSERT INTO contract_functions (contract_id, function_name) VALUES
                                                                ('55555555-5555-5555-5555-555555555555', 'Senior Developer'),
                                                                ('55555555-5555-5555-5555-555555555555', 'Project Manager');