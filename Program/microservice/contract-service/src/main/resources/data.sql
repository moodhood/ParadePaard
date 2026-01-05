-- keep seed scripts compatible with existing databases
CREATE TABLE IF NOT EXISTS functions (
    function_id UUID PRIMARY KEY,
    function_name VARCHAR(255) NOT NULL,
    hourly_wage NUMERIC(19,2) NOT NULL
);

ALTER TABLE IF EXISTS functions ADD COLUMN IF NOT EXISTS function_id UUID;
ALTER TABLE IF EXISTS functions ADD COLUMN IF NOT EXISTS function_name VARCHAR(255);
ALTER TABLE IF EXISTS functions ADD COLUMN IF NOT EXISTS hourly_wage NUMERIC(19,2);

UPDATE functions
SET function_id = COALESCE(function_id, (md5(random()::text || clock_timestamp()::text))::uuid),
    function_name = COALESCE(function_name, 'Unknown'),
    hourly_wage = COALESCE(hourly_wage, 0)
WHERE function_id IS NULL
   OR function_name IS NULL
   OR hourly_wage IS NULL;

ALTER TABLE IF EXISTS functions ALTER COLUMN function_id SET NOT NULL;
ALTER TABLE IF EXISTS functions ALTER COLUMN function_name SET NOT NULL;
ALTER TABLE IF EXISTS functions ALTER COLUMN hourly_wage SET NOT NULL;

ALTER TABLE IF EXISTS contracts ADD COLUMN IF NOT EXISTS contract_type VARCHAR(40);
ALTER TABLE IF EXISTS contracts ADD COLUMN IF NOT EXISTS status VARCHAR(20);
ALTER TABLE IF EXISTS contracts ADD COLUMN IF NOT EXISTS gross_hourly_wage NUMERIC(19,2);
ALTER TABLE IF EXISTS contracts ADD COLUMN IF NOT EXISTS travel_allowance BOOLEAN;
ALTER TABLE IF EXISTS contracts ADD COLUMN IF NOT EXISTS pdf_data BYTEA;
ALTER TABLE IF EXISTS contracts ADD COLUMN IF NOT EXISTS payout_schedule VARCHAR(40);
ALTER TABLE IF EXISTS contracts ADD COLUMN IF NOT EXISTS wage_tax_amount_test NUMERIC(19,2) NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS contracts ALTER COLUMN wage_tax_amount_test SET DEFAULT 0;
ALTER TABLE IF EXISTS contracts ALTER COLUMN payout_schedule SET DEFAULT 'WEEKLY';

UPDATE contracts SET contract_type = 'FIXED_HOURS' WHERE contract_type IS NULL;
UPDATE contracts SET status = 'DRAFT' WHERE status IS NULL;
UPDATE contracts SET wage_tax_amount_test = 0 WHERE wage_tax_amount_test IS NULL;
UPDATE contracts SET payout_schedule = 'WEEKLY' WHERE payout_schedule IS NULL;

INSERT INTO contracts (contract_id, user_id, start_date, end_date, contract_type, gross_hourly_wage, travel_allowance, status, pdf_data)
SELECT 'aaaaaaaa-1111-1111-1111-111111111111',
       '11111111-1111-1111-1111-111111111111',
       '2024-04-01',
       '2025-03-31',
       'FIXED_HOURS',
       18.50,
       true,
       'DRAFT',
       NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM contracts
        WHERE contract_id = 'aaaaaaaa-1111-1111-1111-111111111111'
           OR user_id = '11111111-1111-1111-1111-111111111111'
    );

INSERT INTO contracts (contract_id, user_id, start_date, end_date, contract_type, gross_hourly_wage, travel_allowance, status, pdf_data)
SELECT 'bbbbbbbb-2222-2222-2222-222222222222',
       '11111111-1111-1111-1111-222222222222',
       '2023-12-15',
       '2024-12-14',
       'ON_CALL_RUNNER',
       17.25,
       false,
       'DRAFT',
       NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM contracts
        WHERE contract_id = 'bbbbbbbb-2222-2222-2222-222222222222'
           OR user_id = '11111111-1111-1111-1111-222222222222'
    );

INSERT INTO contracts (contract_id, user_id, start_date, end_date, contract_type, gross_hourly_wage, travel_allowance, status, pdf_data)
SELECT 'cccccccc-3333-3333-3333-333333333333',
       '11111111-1111-1111-1111-333333333333',
       '2024-01-20',
       '2024-09-30',
       'FIXED_HOURS',
       19.75,
       true,
       'SIGNED',
       NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM contracts
        WHERE contract_id = 'cccccccc-3333-3333-3333-333333333333'
           OR user_id = '11111111-1111-1111-1111-333333333333'
    );

INSERT INTO contracts (contract_id, user_id, start_date, end_date, contract_type, gross_hourly_wage, travel_allowance, status, pdf_data)
SELECT 'dddddddd-4444-4444-4444-444444444444',
       '223e4567-e89b-12d3-a456-426614174006',
       '2025-01-01',
       '2026-12-31',
       'ON_CALL_BAR',
       20.00,
       true,
       'SIGNED',
       NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM contracts
        WHERE contract_id = 'dddddddd-4444-4444-4444-444444444444'
           OR user_id = '223e4567-e89b-12d3-a456-426614174006'
    );

INSERT INTO contracts (contract_id, user_id, start_date, end_date, contract_type, gross_hourly_wage, travel_allowance, status, pdf_data)
SELECT '471456c3-ebf6-4ac2-8a87-bbee1facfd43',
       'b825a6bd-50d3-47e0-890d-78bfc59911b7',
       '2025-02-01',
       '2026-01-31',
       'ON_CALL_RUNNER',
       18.75,
       true,
       'SIGNED',
       NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM contracts
        WHERE contract_id = '471456c3-ebf6-4ac2-8a87-bbee1facfd43'
           OR user_id = 'b825a6bd-50d3-47e0-890d-78bfc59911b7'
    );
