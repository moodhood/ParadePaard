CREATE TABLE IF NOT EXISTS payslips
(
    payslip_id              UUID PRIMARY KEY,
    user_id                 UUID NOT NULL,
    date_of_issue           DATE,
    week_number             INTEGER,
    week_based_year         INTEGER,
    name                    VARCHAR(255),
    date_of_birth           DATE,
    street_name             VARCHAR(255),
    house_number            VARCHAR(50),
    house_number_suffix     VARCHAR(20),
    postal_code             VARCHAR(20),
    city                    VARCHAR(255),
    country                 VARCHAR(100),
    hours_worked            NUMERIC(10,2),
    hourly_wage             NUMERIC(10,2),
    total_gross_amount      NUMERIC(19,2),
    wage_tax_withheld_test  NUMERIC(19,2),
    total_net_amount        NUMERIC(19,2)
    );

/* Alice Example: issued 2025-07-01 (ISO week 27, ISO week year 2025), lives in Amsterdam */
INSERT INTO payslips (
    payslip_id,
    user_id,
    date_of_issue,
    week_number,
    week_based_year,
    name,
    date_of_birth,
    street_name,
    house_number,
    house_number_suffix,
    postal_code,
    city,
    country,
    hours_worked,
    hourly_wage,
    total_gross_amount,
    wage_tax_withheld_test,
    total_net_amount
)
SELECT
    'a3f1c2d4-1111-4e5f-8a2b-000000000001'::uuid,
    'b1e2f3a4-2222-4c5d-9b3c-000000000010'::uuid,
    '2025-07-01'::date,
    27,
    2025,
    'Alice Example',
    '1990-03-14'::date,
    'Prinsengracht',
    '263',
    'A',
    '1016 GV',
    'Amsterdam',
    'NL',
    40.0,
    25.0,
    1000.00,
    200.00,
    800.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payslips WHERE payslip_id = 'a3f1c2d4-1111-4e5f-8a2b-000000000001'::uuid
);

/* Bob Worker: issued 2025-07-08 (ISO week 28), Utrecht */
INSERT INTO payslips (
    payslip_id,
    user_id,
    date_of_issue,
    week_number,
    week_based_year,
    name,
    date_of_birth,
    street_name,
    house_number,
    house_number_suffix,
    postal_code,
    city,
    country,
    hours_worked,
    hourly_wage,
    total_gross_amount,
    wage_tax_withheld_test,
    total_net_amount
)
SELECT
    'd4e5f6a7-3333-4b2c-7d1e-000000000002'::uuid,
    'c2f3e4b5-4444-4a1b-8c2d-000000000020'::uuid,
    '2025-07-08'::date,
    28,
    2025,
    'Bob Worker',
    '1985-07-22'::date,
    'Oude Gracht',
    '120',
    NULL,
    '3511 EA',
    'Utrecht',
    'NL',
    35.0,
    30.0,
    1050.00,
    210.00,
    840.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payslips WHERE payslip_id = 'd4e5f6a7-3333-4b2c-7d1e-000000000002'::uuid
);

/* Carol Remote: issued 2025-07-15, Rotterdam */
INSERT INTO payslips (
    payslip_id,
    user_id,
    date_of_issue,
    week_number,
    week_based_year,
    name,
    date_of_birth,
    street_name,
    house_number,
    house_number_suffix,
    postal_code,
    city,
    country,
    hours_worked,
    hourly_wage,
    total_gross_amount,
    wage_tax_withheld_test,
    total_net_amount
)
SELECT
    'f7a8b9c0-5555-4e5f-9e4f-000000000003'::uuid,
    'd3a4b5c6-6666-4d2e-1f3a-000000000030'::uuid,
    '2025-07-15'::date,
    29,
    2025,
    'Carol Remote',
    '1995-11-02'::date,
    'Marktstraat',
    '78',
    NULL,
    '3011 CB',
    'Rotterdam',
    'NL',
    20.0,
    50.0,
    1000.00,
    200.00,
    800.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payslips WHERE payslip_id = 'f7a8b9c0-5555-4e5f-9e4f-000000000003'::uuid
);

/* Dave PartTime: issued 2025-07-22, Eindhoven */
INSERT INTO payslips (
    payslip_id,
    user_id,
    date_of_issue,
    week_number,
    week_based_year,
    name,
    date_of_birth,
    street_name,
    house_number,
    house_number_suffix,
    postal_code,
    city,
    country,
    hours_worked,
    hourly_wage,
    total_gross_amount,
    wage_tax_withheld_test,
    total_net_amount
)
SELECT
    'b0c1d2e3-7777-4a5b-6c7d-000000000004'::uuid,
    'e4b5c6d7-8888-4c1f-2a3b-000000000040'::uuid,
    '2025-07-22'::date,
    30,
    2025,
    'Dave PartTime',
    '1978-02-28'::date,
    'Heuvelstraat',
    '9',
    NULL,
    '5611 HP',
    'Eindhoven',
    'NL',
    10.0,
    15.0,
    150.00,
    30.00,
    120.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payslips WHERE payslip_id = 'b0c1d2e3-7777-4a5b-6c7d-000000000004'::uuid
);

/* Eve Senior: issued 2025-07-29, The Hague */
INSERT INTO payslips (
    payslip_id,
    user_id,
    date_of_issue,
    week_number,
    week_based_year,
    name,
    date_of_birth,
    street_name,
    house_number,
    house_number_suffix,
    postal_code,
    city,
    country,
    hours_worked,
    hourly_wage,
    total_gross_amount,
    wage_tax_withheld_test,
    total_net_amount
)
SELECT
    'c5d6e7f8-9999-4d8a-0b1c-000000000005'::uuid,
    'f5c6d7e8-aaaa-4e9b-1c2d-000000000050'::uuid,
    '2025-07-29'::date,
    31,
    2025,
    'Eve Senior',
    '1982-10-05'::date,
    'Gardenlaan',
    '22',
    NULL,
    '2514 BE',
    'The Hague',
    'NL',
    45.0,
    60.0,
    2700.00,
    540.00,
    2160.00
    WHERE NOT EXISTS (
    SELECT 1 FROM payslips WHERE payslip_id = 'c5d6e7f8-9999-4d8a-0b1c-000000000005'::uuid
);
