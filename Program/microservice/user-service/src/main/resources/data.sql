INSERT INTO users (user_id, email, preferred_name, first_names, middle_name_prefix, last_name, gender, date_of_birth, mobile_number, street, house_number, house_number_suffix, postal_code, city, country, iban, status)
SELECT '11111111-1111-1111-1111-111111111111',
       'jane.doe@example.com',
       'Jane',
       'Jane Maria',
       NULL,
       'Doe',
       'FEMALE',
       '1992-04-12',
       '0611111111',
       'Lindelaan',
       '10',
       'A',
       '3582 AB',
       'Utrecht',
       'Netherlands',
       'NL91ABNA0417164300',
       'ACTIVE'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = '11111111-1111-1111-1111-111111111111');

INSERT INTO users (user_id, email, preferred_name, first_names, middle_name_prefix, last_name, gender, date_of_birth, mobile_number, street, house_number, house_number_suffix, postal_code, city, country, iban, status)
SELECT '22222222-2222-2222-2222-222222222222',
       'mark.vos@example.com',
       'Mark',
       'Mark Pieter',
       'van',
       'Vos',
       'MALE',
       '1988-09-22',
       '0622222222',
       'Eikenstraat',
       '45',
       NULL,
       '1017 CD',
       'Amsterdam',
       'Netherlands',
       'DE89370400440532013000',
       'PENDING_SETUP'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = '22222222-2222-2222-2222-222222222222');

INSERT INTO leave_requests (request_id, user_id, type, start_date, end_date, hours, reason, status, created_at, updated_at)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
       '11111111-1111-1111-1111-111111111111',
       'VACATION',
       '2025-07-15',
       '2025-07-19',
       40,
       'summer holiday',
       'APPROVED',
       '2025-06-01 09:00:00+00',
       '2025-06-05 10:00:00+00'
    WHERE NOT EXISTS (SELECT 1 FROM leave_requests WHERE request_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001');

INSERT INTO leave_requests (request_id, user_id, type, start_date, end_date, hours, reason, status, created_at, updated_at)
SELECT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
       '22222222-2222-2222-2222-222222222222',
       'SICK',
       '2025-02-10',
       '2025-02-11',
       16,
       'flu',
       'PENDING',
       '2025-02-10 08:30:00+00',
       '2025-02-10 08:30:00+00'
    WHERE NOT EXISTS (SELECT 1 FROM leave_requests WHERE request_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001');
