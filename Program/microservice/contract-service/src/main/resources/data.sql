INSERT INTO contracts (contract_id, user_id, start_date, end_date, contract_type, gross_hourly_wage, travel_allowance, status)
SELECT 'aaaaaaaa-1111-1111-1111-111111111111',
       '11111111-1111-1111-1111-111111111111',
       '2024-04-01',
       '2025-03-31',
       'FIXED',
       18.50,
       true,
       'DRAFT'
    WHERE NOT EXISTS (SELECT 1 FROM contracts WHERE contract_id = 'aaaaaaaa-1111-1111-1111-111111111111');

INSERT INTO contracts (contract_id, user_id, start_date, end_date, contract_type, gross_hourly_wage, travel_allowance, status)
SELECT 'bbbbbbbb-2222-2222-2222-222222222222',
       '11111111-1111-1111-1111-222222222222',
       '2023-12-15',
       '2024-12-14',
       'ON_CALL',
       17.25,
       false,
       'DRAFT'
    WHERE NOT EXISTS (SELECT 1 FROM contracts WHERE contract_id = 'bbbbbbbb-2222-2222-2222-222222222222');

INSERT INTO contracts (contract_id, user_id, start_date, end_date, contract_type, gross_hourly_wage, travel_allowance, status)
SELECT 'cccccccc-3333-3333-3333-333333333333',
       '11111111-1111-1111-1111-333333333333',
       '2024-01-20',
       '2024-09-30',
       'FIXED',
       19.75,
       true,
       'DRAFT'
    WHERE NOT EXISTS (SELECT 1 FROM contracts WHERE contract_id = 'cccccccc-3333-3333-3333-333333333333');
