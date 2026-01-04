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
    WHERE NOT EXISTS (SELECT 1 FROM contracts WHERE contract_id = 'aaaaaaaa-1111-1111-1111-111111111111');

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
    WHERE NOT EXISTS (SELECT 1 FROM contracts WHERE contract_id = 'bbbbbbbb-2222-2222-2222-222222222222');

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
    WHERE NOT EXISTS (SELECT 1 FROM contracts WHERE contract_id = 'cccccccc-3333-3333-3333-333333333333');

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
    WHERE NOT EXISTS (SELECT 1 FROM contracts WHERE contract_id = 'dddddddd-4444-4444-4444-444444444444');
