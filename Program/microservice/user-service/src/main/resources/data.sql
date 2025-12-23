CREATE TABLE IF NOT EXISTS users
(
    user_id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    initials VARCHAR(20),
    nickname VARCHAR(100),
    first_names VARCHAR(255),
    infix VARCHAR(50),
    last_name VARCHAR(255),
    gender VARCHAR(50),
    street_name VARCHAR(255),
    house_number VARCHAR(20),
    house_number_suffix VARCHAR(10),
    postal_code VARCHAR(20),
    city VARCHAR(100),
    country VARCHAR(100),
    iban VARCHAR(34),
    account_holder_name VARCHAR(255),
    bank_country VARCHAR(100),
    nationality VARCHAR(100),
    id_type VARCHAR(50),
    id_number VARCHAR(50),
    id_issue_date DATE,
    id_expiration_date DATE,
    physically_demanding BOOLEAN,
    apply_payroll_tax BOOLEAN,
    previous_contract_in_last_six_months BOOLEAN,
    date_of_birth DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    registered_date DATE NOT NULL,
    bank_account_number VARCHAR(34) UNIQUE,
    phone_number VARCHAR(20),
    mobile_number VARCHAR(20),
    leave_hours VARCHAR(20)
    );

ALTER TABLE users DROP COLUMN IF EXISTS role;

INSERT INTO users (user_id, email, name, initials, nickname, first_names, infix, last_name, gender, street_name, house_number, house_number_suffix, postal_code, city, country, iban, account_holder_name, bank_country, nationality, id_type, id_number, id_issue_date, id_expiration_date, physically_demanding, apply_payroll_tax, previous_contract_in_last_six_months, date_of_birth, registered_date, bank_account_number, phone_number, mobile_number, leave_hours)
SELECT '11111111-1111-1111-1111-111111111111',
       'alice.brown@example.com',
       'Alice Brown',
       'AB',
       'Ali',
       'Alice Marie',
       NULL,
       'Brown',
       'FEMALE',
       'Lindelaan',
       '34',
       'A',
       '3582 AB',
       'Utrecht',
       'Netherlands',
       'NL91ABNA0417164300',
       'Alice Brown',
       'NL',
       'Dutch',
       'PASSPORT',
       'NLP1234567',
       '2016-05-01',
       '2026-05-01',
       true,
       true,
       false,
       '1990-03-14',
       '2024-04-01',
       'NL91ABNA0417164300',
       '5551230001',
       '0612340001',
       '120'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = '11111111-1111-1111-1111-111111111111');

INSERT INTO users (user_id, email, name, initials, nickname, first_names, infix, last_name, gender, street_name, house_number, house_number_suffix, postal_code, city, country, iban, account_holder_name, bank_country, nationality, id_type, id_number, id_issue_date, id_expiration_date, physically_demanding, apply_payroll_tax, previous_contract_in_last_six_months, date_of_birth, registered_date, bank_account_number, phone_number, mobile_number, leave_hours)
SELECT '11111111-1111-1111-1111-222222222222',
       'bob.adams@example.com',
       'Bob Adams',
       'BA',
       'Bobby',
       'Bob Edward',
       'van',
       'Adams',
       'MALE',
       'Eikenstraat',
       '56',
       NULL,
       '1017 CD',
       'Amsterdam',
       'Netherlands',
       'DE89370400440532013000',
       'Bob Adams',
       'DE',
       'Dutch',
       'ID_CARD',
       'NLID654321',
       '2018-08-10',
       '2028-08-10',
       true,
       false,
       false,
       '1985-07-22',
       '2023-12-15',
       'DE89370400440532013000',
       '5551230002',
       '0612340002',
       '96'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = '11111111-1111-1111-1111-222222222222');

INSERT INTO users (user_id, email, name, initials, nickname, first_names, infix, last_name, gender, street_name, house_number, house_number_suffix, postal_code, city, country, iban, account_holder_name, bank_country, nationality, id_type, id_number, id_issue_date, id_expiration_date, physically_demanding, apply_payroll_tax, previous_contract_in_last_six_months, date_of_birth, registered_date, bank_account_number, phone_number, mobile_number, leave_hours)
SELECT '11111111-1111-1111-1111-333333333333',
       'carol.chen@example.com',
       'Carol Chen',
       'CC',
       'Carrie',
       'Carol Mei',
       NULL,
       'Chen',
       'FEMALE',
       'Beukenlaan',
       '78',
       NULL,
       '5616 DC',
       'Eindhoven',
       'Netherlands',
       'GB29NWBK60161331926819',
       'Carol Chen',
       'GB',
       'Dutch',
       'PASSPORT',
       'GBX998877',
       '2017-02-12',
       '2027-02-12',
       false,
       true,
       true,
       '1995-11-02',
       '2024-01-20',
       'GB29NWBK60161331926819',
       '5551230003',
       '0612340003',
       '88'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = '11111111-1111-1111-1111-333333333333');

INSERT INTO users (user_id, email, name, initials, nickname, first_names, infix, last_name, gender, street_name, house_number, house_number_suffix, postal_code, city, country, iban, account_holder_name, bank_country, nationality, id_type, id_number, id_issue_date, id_expiration_date, physically_demanding, apply_payroll_tax, previous_contract_in_last_six_months, date_of_birth, registered_date, bank_account_number, phone_number, mobile_number, leave_hours)
SELECT '11111111-1111-1111-1111-444444444444',
       'dan.evans@example.com',
       'Dan Evans',
       'DE',
       'Danny',
       'Daniel Thomas',
       NULL,
       'Evans',
       'MALE',
       'Perenstraat',
       '12',
       NULL,
       '7311 EF',
       'Apeldoorn',
       'Netherlands',
       'FR1420041010050500013M02606',
       'Dan Evans',
       'FR',
       'Dutch',
       'DRIVER_LICENSE',
       'D12345678',
       '2015-09-15',
       '2025-09-15',
       true,
       true,
       false,
       '1978-02-28',
       '2022-09-05',
       'FR1420041010050500013M02606',
       '5551230004',
       '0612340004',
       '140'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = '11111111-1111-1111-1111-444444444444');

INSERT INTO users (user_id, email, name, initials, nickname, first_names, infix, last_name, gender, street_name, house_number, house_number_suffix, postal_code, city, country, iban, account_holder_name, bank_country, nationality, id_type, id_number, id_issue_date, id_expiration_date, physically_demanding, apply_payroll_tax, previous_contract_in_last_six_months, date_of_birth, registered_date, bank_account_number, phone_number, mobile_number, leave_hours)
SELECT '22222222-2222-2222-2222-111111111111',
       'ella.fisher@example.com',
       'Ella Fisher',
       'EF',
       'Elle',
       'Ella Rose',
       NULL,
       'Fisher',
       'FEMALE',
       'Kastanjelaan',
       '9',
       'B',
       '2313 GH',
       'Leiden',
       'Netherlands',
       'ES9121000418450200051332',
       'Ella Fisher',
       'ES',
       'Dutch',
       'ID_CARD',
       'NLID112233',
       '2019-03-20',
       '2029-03-20',
       false,
       false,
       true,
       '1992-06-10',
       '2023-03-12',
       'ES9121000418450200051332',
       '5551230005',
       '0612340005',
       '72'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = '22222222-2222-2222-2222-111111111111');

-- leave requests table
CREATE TABLE IF NOT EXISTS leave_requests
(
    request_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL,              -- VACATION, SICK, UNPAID, PARENTAL, OTHER
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    hours INTEGER NOT NULL,
    reason VARCHAR(1000),
    status VARCHAR(32) NOT NULL,            -- PENDING, APPROVED, REJECTED, CANCELED
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                        );

CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);

-- alice brown
INSERT INTO leave_requests (request_id, user_id, type, start_date, end_date, hours, reason, status, created_at, updated_at)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
       '11111111-1111-1111-1111-111111111111',
       'VACATION',
       '2024-07-15', '2024-07-19',
       40,
       'summer trip',
       'APPROVED',
       '2024-06-01 09:00:00+00',
       '2024-06-05 10:00:00+00'
    WHERE NOT EXISTS (SELECT 1 FROM leave_requests WHERE request_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001');

INSERT INTO leave_requests (request_id, user_id, type, start_date, end_date, hours, reason, status, created_at, updated_at)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
       '11111111-1111-1111-1111-111111111111',
       'SICK',
       '2025-01-08', '2025-01-09',
       16,
       'flu',
       'APPROVED',
       '2025-01-08 08:30:00+00',
       '2025-01-10 11:15:00+00'
    WHERE NOT EXISTS (SELECT 1 FROM leave_requests WHERE request_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002');

-- bob adams
INSERT INTO leave_requests (request_id, user_id, type, start_date, end_date, hours, reason, status, created_at, updated_at)
SELECT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
       '11111111-1111-1111-1111-222222222222',
       'VACATION',
       '2025-02-17', '2025-02-21',
       40,
       'winter break',
       'PENDING',
       '2025-01-30 12:00:00+00',
       '2025-01-30 12:00:00+00'
    WHERE NOT EXISTS (SELECT 1 FROM leave_requests WHERE request_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001');

INSERT INTO leave_requests (request_id, user_id, type, start_date, end_date, hours, reason, status, created_at, updated_at)
SELECT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
       '11111111-1111-1111-1111-222222222222',
       'UNPAID',
       '2024-11-29', '2024-11-29',
       8,
       'moving day',
       'REJECTED',
       '2024-11-20 14:00:00+00',
       '2024-11-21 09:20:00+00'
    WHERE NOT EXISTS (SELECT 1 FROM leave_requests WHERE request_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002');

-- carol chen
INSERT INTO leave_requests (request_id, user_id, type, start_date, end_date, hours, reason, status, created_at, updated_at)
SELECT 'cccccccc-cccc-cccc-cccc-cccccccc0001',
       '11111111-1111-1111-1111-333333333333',
       'SICK',
       '2024-12-03', '2024-12-03',
       8,
       'migraine',
       'APPROVED',
       '2024-12-03 07:45:00+00',
       '2024-12-04 09:10:00+00'
    WHERE NOT EXISTS (SELECT 1 FROM leave_requests WHERE request_id = 'cccccccc-cccc-cccc-cccc-cccccccc0001');

INSERT INTO leave_requests (request_id, user_id, type, start_date, end_date, hours, reason, status, created_at, updated_at)
SELECT 'cccccccc-cccc-cccc-cccc-cccccccc0002',
       '11111111-1111-1111-1111-333333333333',
       'VACATION',
       '2025-06-03', '2025-06-07',
       40,
       'family visit',
       'PENDING',
       '2025-04-15 10:00:00+00',
       '2025-04-15 10:00:00+00'
    WHERE NOT EXISTS (SELECT 1 FROM leave_requests WHERE request_id = 'cccccccc-cccc-cccc-cccc-cccccccc0002');

-- dan evans
INSERT INTO leave_requests (request_id, user_id, type, start_date, end_date, hours, reason, status, created_at, updated_at)
SELECT 'dddddddd-dddd-dddd-dddd-dddddddd0001',
       '11111111-1111-1111-1111-444444444444',
       'PARENTAL',
       '2024-05-01', '2024-05-31',
       120,
       'parental leave',
       'APPROVED',
       '2024-04-01 09:00:00+00',
       '2024-05-01 09:00:00+00'
    WHERE NOT EXISTS (SELECT 1 FROM leave_requests WHERE request_id = 'dddddddd-dddd-dddd-dddd-dddddddd0001');

INSERT INTO leave_requests (request_id, user_id, type, start_date, end_date, hours, reason, status, created_at, updated_at)
SELECT 'dddddddd-dddd-dddd-dddd-dddddddd0002',
       '11111111-1111-1111-1111-444444444444',
       'OTHER',
       '2025-03-14', '2025-03-14',
       4,
       'appointment',
       'CANCELED',
       '2025-03-01 13:00:00+00',
       '2025-03-10 08:30:00+00'
    WHERE NOT EXISTS (SELECT 1 FROM leave_requests WHERE request_id = 'dddddddd-dddd-dddd-dddd-dddddddd0002');

-- ella fisher
INSERT INTO leave_requests (request_id, user_id, type, start_date, end_date, hours, reason, status, created_at, updated_at)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0001',
       '22222222-2222-2222-2222-111111111111',
       'VACATION',
       '2025-08-12', '2025-08-16',
       40,
       'summer holiday',
       'PENDING',
       '2025-05-10 11:00:00+00',
       '2025-05-10 11:00:00+00'
    WHERE NOT EXISTS (SELECT 1 FROM leave_requests WHERE request_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0001');

INSERT INTO leave_requests (request_id, user_id, type, start_date, end_date, hours, reason, status, created_at, updated_at)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0002',
       '22222222-2222-2222-2222-111111111111',
       'SICK',
       '2025-10-05', '2025-10-06',
       16,
       'fever',
       'APPROVED',
       '2025-10-05 08:10:00+00',
       '2025-10-07 09:45:00+00'
    WHERE NOT EXISTS (SELECT 1 FROM leave_requests WHERE request_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0002');
