CREATE TABLE IF NOT EXISTS users
(
    user_id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    street_name VARCHAR(255),
    house_number VARCHAR(20),
    house_number_suffix VARCHAR(10),
    postal_code VARCHAR(20),
    city VARCHAR(100),
    country VARCHAR(100),
    date_of_birth DATE,
    registered_date DATE NOT NULL,
    bank_account_number VARCHAR(34) UNIQUE,
    phone_number VARCHAR(20)
    );

ALTER TABLE users DROP COLUMN IF EXISTS role;

INSERT INTO users (user_id, email, name, street_name, house_number, house_number_suffix, postal_code, city, country, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '11111111-1111-1111-1111-111111111111',
       'alice.brown@example.com',
       'Alice Brown',
       'Lindelaan',
       '34',
       'A',
       '3582 AB',
       'Utrecht',
       'Netherlands',
       '1990-03-14',
       '2024-04-01',
       'NL91ABNA0417164300',
       '5551230001'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = '11111111-1111-1111-1111-111111111111');

INSERT INTO users (user_id, email, name, street_name, house_number, house_number_suffix, postal_code, city, country, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '11111111-1111-1111-1111-222222222222',
       'bob.adams@example.com',
       'Bob Adams',
       'Eikenstraat',
       '56',
       NULL,
       '1017 CD',
       'Amsterdam',
       'Netherlands',
       '1985-07-22',
       '2023-12-15',
       'DE89370400440532013000',
       '5551230002'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = '11111111-1111-1111-1111-222222222222');

INSERT INTO users (user_id, email, name, street_name, house_number, house_number_suffix, postal_code, city, country, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '11111111-1111-1111-1111-333333333333',
       'carol.chen@example.com',
       'Carol Chen',
       'Beukenlaan',
       '78',
       NULL,
       '5616 DC',
       'Eindhoven',
       'Netherlands',
       '1995-11-02',
       '2024-01-20',
       'GB29NWBK60161331926819',
       '5551230003'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = '11111111-1111-1111-1111-333333333333');

INSERT INTO users (user_id, email, name, street_name, house_number, house_number_suffix, postal_code, city, country, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '11111111-1111-1111-1111-444444444444',
       'dan.evans@example.com',
       'Dan Evans',
       'Perenstraat',
       '12',
       NULL,
       '7311 EF',
       'Apeldoorn',
       'Netherlands',
       '1978-02-28',
       '2022-09-05',
       'FR1420041010050500013M02606',
       '5551230004'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = '11111111-1111-1111-1111-444444444444');

INSERT INTO users (user_id, email, name, street_name, house_number, house_number_suffix, postal_code, city, country, date_of_birth, registered_date, bank_account_number, phone_number)
SELECT '22222222-2222-2222-2222-111111111111',
       'ella.fisher@example.com',
       'Ella Fisher',
       'Kastanjelaan',
       '9',
       'B',
       '2313 GH',
       'Leiden',
       'Netherlands',
       '1992-06-10',
       '2023-03-12',
       'ES9121000418450200051332',
       '5551230005'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = '22222222-2222-2222-2222-111111111111');
