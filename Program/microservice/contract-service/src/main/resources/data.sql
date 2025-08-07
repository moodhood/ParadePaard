/* ------------------------------------------------------------------
   TABLE DEFINITIONS
   ------------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS contracts
(
    contract_id           UUID PRIMARY KEY,
    user_id               UUID    NOT NULL,
    start_date            DATE    NOT NULL,
    end_date              DATE    NOT NULL,
    wage_tax_amount_test  NUMERIC(19,2) NOT NULL
    );

CREATE TABLE IF NOT EXISTS functions
(
    function_id   UUID PRIMARY KEY,
    function_name VARCHAR(255) NOT NULL,
    hourly_rate   NUMERIC(19,2) NOT NULL
    );

/* ------------------------------------------------------------------
   CONTRACTS
   ------------------------------------------------------------------ */

/* Contract Alpha: full year 2025 */
INSERT INTO contracts (
    contract_id,
    user_id,
    start_date,
    end_date,
    wage_tax_amount_test
)
SELECT
    '11111111-1111-1111-1111-111111111111'::uuid,
    'b1e2f3a4-2222-4c5d-9b3c-000000000010'::uuid,  -- Alice Example
    '2025-01-01'::date,
    '2025-12-31'::date,
    3000.00
    WHERE NOT EXISTS (
    SELECT 1 FROM contracts WHERE contract_id = '11111111-1111-1111-1111-111111111111'::uuid
);

/* Contract Bravo: February through August */
INSERT INTO contracts (
    contract_id,
    user_id,
    start_date,
    end_date,
    wage_tax_amount_test
)
SELECT
    '22222222-2222-2222-2222-222222222222'::uuid,
    'c2f3e4b5-4444-4a1b-8c2d-000000000020'::uuid,  -- Bob Worker
    '2025-02-01'::date,
    '2025-08-31'::date,
    1500.00
    WHERE NOT EXISTS (
    SELECT 1 FROM contracts WHERE contract_id = '22222222-2222-2222-2222-222222222222'::uuid
);

/* Contract Charlie: mid March to mid September */
INSERT INTO contracts (
    contract_id,
    user_id,
    start_date,
    end_date,
    wage_tax_amount_test
)
SELECT
    '33333333-3333-3333-3333-333333333333'::uuid,
    'd3a4b5c6-6666-4d2e-1f3a-000000000030'::uuid,  -- Carol Remote
    '2025-03-15'::date,
    '2025-09-14'::date,
    2500.00
    WHERE NOT EXISTS (
    SELECT 1 FROM contracts WHERE contract_id = '33333333-3333-3333-3333-333333333333'::uuid
);

/* Contract Delta: April to October */
INSERT INTO contracts (
    contract_id,
    user_id,
    start_date,
    end_date,
    wage_tax_amount_test
)
SELECT
    '44444444-4444-4444-4444-444444444444'::uuid,
    'e4b5c6d7-8888-4c1f-2a3b-000000000040'::uuid,  -- Dave PartTime
    '2025-04-10'::date,
    '2025-10-09'::date,
    1800.00
    WHERE NOT EXISTS (
    SELECT 1 FROM contracts WHERE contract_id = '44444444-4444-4444-4444-444444444444'::uuid
);

/* Contract Echo: May to November */
INSERT INTO contracts (
    contract_id,
    user_id,
    start_date,
    end_date,
    wage_tax_amount_test
)
SELECT
    '55555555-5555-5555-5555-555555555555'::uuid,
    'f5c6d7e8-aaaa-4e9b-1c2d-000000000050'::uuid,  -- Eve Senior
    '2025-05-01'::date,
    '2025-11-30'::date,
    3200.00
    WHERE NOT EXISTS (
    SELECT 1 FROM contracts WHERE contract_id = '55555555-5555-5555-5555-555555555555'::uuid
);

/* ------------------------------------------------------------------
   FUNCTIONS
   ------------------------------------------------------------------ */

/* Junior Developer */
INSERT INTO functions (
    function_id,
    function_name,
    hourly_rate
)
SELECT
    'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'Junior Developer',
    25.00
    WHERE NOT EXISTS (
    SELECT 1 FROM functions WHERE function_id = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid
);

/* Senior Developer */
INSERT INTO functions (
    function_id,
    function_name,
    hourly_rate
)
SELECT
    'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    'Senior Developer',
    45.00
    WHERE NOT EXISTS (
    SELECT 1 FROM functions WHERE function_id = 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
);

/* Project Manager */
INSERT INTO functions (
    function_id,
    function_name,
    hourly_rate
)
SELECT
    'ccccccc3-cccc-cccc-cccc-cccccccccccc'::uuid,
    'Project Manager',
    60.00
    WHERE NOT EXISTS (
    SELECT 1 FROM functions WHERE function_id = 'ccccccc3-cccc-cccc-cccc-cccccccccccc'::uuid
);

/* Tester */
INSERT INTO functions (
    function_id,
    function_name,
    hourly_rate
)
SELECT
    'ddddddd4-dddd-dddd-dddd-dddddddddddd'::uuid,
    'Tester',
    30.00
    WHERE NOT EXISTS (
    SELECT 1 FRO
