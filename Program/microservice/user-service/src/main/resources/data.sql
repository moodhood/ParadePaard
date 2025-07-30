-- Ensure the 'users' table exists
CREATE TABLE IF NOT EXISTS users
(
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    address VARCHAR(255),
    date_of_birth DATE,
    registered_date DATE NOT NULL,
    bank_account_number VARCHAR(34) UNIQUE,
    phone_number VARCHAR(20)
    );

-- Insert well known UUIDs for specific users
INSERT INTO users (id, email, name, role, address, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '11111111-1111-1111-1111-111111111111',
       'alice.brown@example.com',
       'Alice Brown',
       'USER',
       '123 Maple Rd, Springfield',
       '1990-03-14',
       '2024-04-01',
       'NL91ABNA0417164300',
       '5551230001'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '11111111-1111-1111-1111-111111111111');

INSERT INTO users (id, email, name, role, address, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '11111111-1111-1111-1111-222222222222',
       'bob.adams@example.com',
       'Bob Adams',
       'ADMIN',
       '456 Oak Rd, Shelbyville',
       '1985-07-22',
       '2023-12-15',
       'DE89370400440532013000',
       '5551230002'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '11111111-1111-1111-1111-222222222222');

INSERT INTO users (id, email, name, role, address, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '11111111-1111-1111-1111-333333333333',
       'carol.chen@example.com',
       'Carol Chen',
       'USER',
       '789 Elm Rd, Capital City',
       '1995-11-02',
       '2024-01-20',
       'GB29NWBK60161331926819',
       '5551230003'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '11111111-1111-1111-1111-333333333333');

INSERT INTO users (id, email, name, role, address, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '11111111-1111-1111-1111-444444444444',
       'dan.evans@example.com',
       'Dan Evans',
       'MANAGER',
       '321 Pine Rd, Springfield',
       '1978-02-28',
       '2022-09-05',
       'FR1420041010050500013M02606',
       '5551230004'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '11111111-1111-1111-1111-444444444444');

INSERT INTO users (id, email, name, role, address, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '22222222-2222-2222-2222-111111111111',
       'ella.fisher@example.com',
       'Ella Fisher',
       'USER',
       '654 Cedar Rd, Shelbyville',
       '1992-06-10',
       '2023-03-12',
       'ES9121000418450200051332',
       '5551230005'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '22222222-2222-2222-2222-111111111111');

INSERT INTO users (id, email, name, role, address, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '22222222-2222-2222-2222-222222222222',
       'frank.garcia@example.com',
       'Frank Garcia',
       'ANALYST',
       '987 Birch Rd, Capital City',
       '1982-12-01',
       '2023-11-07',
       'IT60X0542811101000000123456',
       '5551230006'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '22222222-2222-2222-2222-222222222222');

INSERT INTO users (id, email, name, role, address, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '22222222-2222-2222-2222-333333333333',
       'grace.hall@example.com',
       'Grace Hall',
       'USER',
       '147 Willow Rd, Springfield',
       '1988-04-18',
       '2024-05-02',
       'BE68539007547034',
       '5551230007'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '22222222-2222-2222-2222-333333333333');

INSERT INTO users (id, email, name, role, address, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '33333333-3333-3333-3333-111111111111',
       'henry.irwin@example.com',
       'Henry Irwin',
       'USER',
       '258 Aspen Rd, Shelbyville',
       '1999-09-09',
       '2024-02-27',
       'CH9300762011623852957',
       '5551230008'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '33333333-3333-3333-3333-111111111111');

INSERT INTO users (id, email, name, role, address, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '33333333-3333-3333-3333-222222222222',
       'ivy.jones@example.com',
       'Ivy Jones',
       'ADMIN',
       '369 Poplar Rd, Capital City',
       '1987-01-05',
       '2022-12-20',
       'NL02ABNA0123456789',
       '5551230009'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '33333333-3333-3333-3333-222222222222');

INSERT INTO users (id, email, name, role, address, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '44444444-4444-4444-4444-444444444444',
       'jack.king@example.com',
       'Jack King',
       'USER',
       '159 Walnut Rd, Springfield',
       '1976-08-30',
       '2023-06-18',
       'SE4550000000058398257466',
       '5551230010'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '44444444-4444-4444-4444-444444444444');

INSERT INTO users (id, email, name, role, address, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '55555555-5555-5555-5555-555555555555',
       'kate.lee@example.com',
       'Kate Lee',
       'MANAGER',
       '753 Fir Rd, Shelbyville',
       '1994-05-12',
       '2022-07-11',
       'AT611904300234573201',
       '5551230011'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '55555555-5555-5555-5555-555555555555');

INSERT INTO users (id, email, name, role, address, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '66666666-6666-6666-6666-666666666666',
       'leo.miller@example.com',
       'Leo Miller',
       'USER',
       '852 Cypress Rd, Capital City',
       '1989-12-19',
       '2023-10-03',
       'DK5000400440116243',
       '5551230012'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '66666666-6666-6666-6666-666666666666');

INSERT INTO users (id, email, name, role, address, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '77777777-7777-7777-7777-777777777777',
       'mia.nelson@example.com',
       'Mia Nelson',
       'ANALYST',
       '951 Dogwood Rd, Springfield',
       '1983-03-27',
       '2023-01-29',
       'FI2112345600000785',
       '5551230013'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '77777777-7777-7777-7777-777777777777');

INSERT INTO users (id, email, name, role, address, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '88888888-8888-8888-8888-888888888888',
       'noah.owens@example.com',
       'Noah Owens',
       'USER',
       '357 Chestnut Rd, Shelbyville',
       '1996-10-22',
       '2024-03-14',
       'GR1601101250000000012300695',
       '5551230014'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '88888888-8888-8888-8888-888888888888');

INSERT INTO users (id, email, name, role, address, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '99999999-9999-9999-9999-999999999999',
       'olivia.parker@example.com',
       'Olivia Parker',
       'ADMIN',
       '486 Magnolia Rd, Capital City',
       '1979-11-11',
       '2023-04-07',
       'PL10105000997603123456789123',
       '5551230015'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '99999999-9999-9999-9999-999999999999');
