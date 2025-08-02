
CREATE TABLE IF NOT EXISTS payslips
(
    payslip_id              UUID PRIMARY KEY,
    user_id                 UUID NOT NULL,
    date_of_issue           DATE,
    name                    VARCHAR(255),
    address                 VARCHAR(255),
    hours_worked            INTEGER,
    hourly_wage             INTEGER,
    total_gross_amount      NUMERIC(19,2),
    wage_tax_withheld_test  NUMERIC(19,2),
    total_net_amount        NUMERIC(19,2)
    );

/* sample payslips */

/* Alice Example: issued 2025-07-01, 40 hours at 25 = 1000 gross, 200 tax, 800 net */
INSERT INTO payslips (
    payslip_id,
    user_id,
    date_of_issue,
    name,
    address,
    hours_worked,
    hourly_wage,
    total_gross_amount,
    wage_tax_withheld_test,
    total_net_amount
)
SELECT
    'a3f1c2d4-1111-4e5f-8a2b-000000000001',
    'b1e2f3a4-2222-4c5d-9b3c-000000000010',
    '2025-07-01'::date,
    'Alice Example',
    '12 River Rd, Amsterdam',
    40,
    25,
    1000.00,
    200.00,
    800.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payslips WHERE payslip_id = 'a3f1c2d4-1111-4e5f-8a2b-000000000001'
);

/* Bob Worker: issued 2025-07-08, 35 hours at 30 = 1050 gross, 210 tax, 840 net */
INSERT INTO payslips (
    payslip_id,
    user_id,
    date_of_issue,
    name,
    address,
    hours_worked,
    hourly_wage,
    total_gross_amount,
    wage_tax_withheld_test,
    total_net_amount
)
SELECT
    'd4e5f6a7-3333-4b2c-7d1e-000000000002',
    'c2f3e4b5-4444-4a1b-8c2d-000000000020',
    '2025-07-08'::date,
    'Bob Worker',
    '34 Canal St, Utrecht',
    35,
    30,
    1050.00,
    210.00,
    840.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payslips WHERE payslip_id = 'd4e5f6a7-3333-4b2c-7d1e-000000000002'
);

/* Carol Remote: issued 2025-07-15, 20 hours at 50 = 1000 gross, 200 tax, 800 net */
INSERT INTO payslips (
    payslip_id,
    user_id,
    date_of_issue,
    name,
    address,
    hours_worked,
    hourly_wage,
    total_gross_amount,
    wage_tax_withheld_test,
    total_net_amount
)
SELECT
    'f7a8b9c0-5555-4f3d-9e4f-000000000003',
    'd3a4b5c6-6666-4d2e-1f3a-000000000030',
    '2025-07-15'::date,
    'Carol Remote',
    '78 Market Ave, Rotterdam',
    20,
    50,
    1000.00,
    200.00,
    800.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payslips WHERE payslip_id = 'f7a8b9c0-5555-4f3d-9e4f-000000000003'
);

/* Dave PartTime: issued 2025-07-22, 10 hours at 15 = 150 gross, 30 tax, 120 net */
INSERT INTO payslips (
    payslip_id,
    user_id,
    date_of_issue,
    name,
    address,
    hours_worked,
    hourly_wage,
    total_gross_amount,
    wage_tax_withheld_test,
    total_net_amount
)
SELECT
    'b0c1d2e3-7777-4a5b-6c7d-000000000004',
    'e4b5c6d7-8888-4c1f-2a3b-000000000040',
    '2025-07-22'::date,
    'Dave PartTime',
    '9 Hill St, Eindhoven',
    10,
    15,
    150.00,
    30.00,
    120.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payslips WHERE payslip_id = 'b0c1d2e3-7777-4a5b-6c7d-000000000004'
);

/* Eve Senior: issued 2025-07-29, 45 hours at 60 = 2700 gross, 540 tax, 2160 net */
INSERT INTO payslips (
    payslip_id,
    user_id,
    date_of_issue,
    name,
    address,
    hours_worked,
    hourly_wage,
    total_gross_amount,
    wage_tax_withheld_test,
    total_net_amount
)
SELECT
    'c5d6e7f8-9999-4d8a-0b1c-000000000005',
    'f5c6d7e8-aaaa-4e9b-1c2d-000000000050',
    '2025-07-29'::date,
    'Eve Senior',
    '22 Garden Ln, The Hague',
    45,
    60,
    2700.00,
    540.00,
    2160.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payslips WHERE payslip_id = 'c5d6e7f8-9999-4d8a-0b1c-000000000005'
);
