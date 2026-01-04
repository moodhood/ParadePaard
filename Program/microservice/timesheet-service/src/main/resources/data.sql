/* ---------- TABLE ---------- */
CREATE TABLE IF NOT EXISTS timesheets
(
    timesheet_id      UUID PRIMARY KEY,
    user_id           UUID NOT NULL,
    date_of_issue     DATE NOT NULL,
    week_number       INTEGER,
    week_based_year   INTEGER,
    name              VARCHAR(255),
    function          VARCHAR(255),
    hours_worked      NUMERIC(19,2),
    travel_expenses   NUMERIC(19,2)
    );

/* ---------- SAMPLE ROWS ---------- */

/* Alice Developer: issued 2025 07 01 (ISO week 27) */
INSERT INTO timesheets (
    timesheet_id,
    user_id,
    date_of_issue,
    week_number,
    week_based_year,
    name,
    function,
    hours_worked,
    travel_expenses
)
SELECT
    'a3f1c2d4-1111-4e5f-8a2b-000000000011'::uuid,
    'b1e2f3a4-2222-4c5d-9b3c-000000000010'::uuid,
    '2025-07-01'::date,
    27,
    2025,
    'Alice Example',
    'Developer',
    40.00,
    12.50
    WHERE NOT EXISTS (
    SELECT 1
    FROM timesheets
    WHERE timesheet_id = 'a3f1c2d4-1111-4e5f-8a2b-000000000011'::uuid
);

/* Bob Tester: issued 2025 07 08 (ISO week 28) */
INSERT INTO timesheets (
    timesheet_id,
    user_id,
    date_of_issue,
    week_number,
    week_based_year,
    name,
    function,
    hours_worked,
    travel_expenses
)
SELECT
    'd4e5f6a7-3333-4b2c-7d1e-000000000012'::uuid,
    'c2f3e4b5-4444-4a1b-8c2d-000000000020'::uuid,
    '2025-07-08'::date,
    28,
    2025,
    'Bob Worker',
    'Tester',
    35.00,
    0.00
    WHERE NOT EXISTS (
    SELECT 1
    FROM timesheets
    WHERE timesheet_id = 'd4e5f6a7-3333-4b2c-7d1e-000000000012'::uuid
);

/* Carol Designer: issued 2025 07 15 (ISO week 29) */
INSERT INTO timesheets (
    timesheet_id,
    user_id,
    date_of_issue,
    week_number,
    week_based_year,
    name,
    function,
    hours_worked,
    travel_expenses
)
SELECT
    'f7a8b9c0-5555-4e5f-9e4f-000000000013'::uuid,
    'd3a4b5c6-6666-4d2e-1f3a-000000000030'::uuid,
    '2025-07-15'::date,
    29,
    2025,
    'Carol Remote',
    'Designer',
    20.00,
    7.80
    WHERE NOT EXISTS (
    SELECT 1
    FROM timesheets
    WHERE timesheet_id = 'f7a8b9c0-5555-4e5f-9e4f-000000000013'::uuid
);

/* Dave Support: issued 2025 07 22 (ISO week 30) */
INSERT INTO timesheets (
    timesheet_id,
    user_id,
    date_of_issue,
    week_number,
    week_based_year,
    name,
    function,
    hours_worked,
    travel_expenses
)
SELECT
    'b0c1d2e3-7777-4a5b-6c7d-000000000014'::uuid,
    'e4b5c6d7-8888-4c1f-2a3b-000000000040'::uuid,
    '2025-07-22'::date,
    30,
    2025,
    'Dave PartTime',
    'Support',
    10.00,
    3.20
    WHERE NOT EXISTS (
    SELECT 1
    FROM timesheets
    WHERE timesheet_id = 'b0c1d2e3-7777-4a5b-6c7d-000000000014'::uuid
);

/* Eve Manager: issued 2025 07 29 (ISO week 31) */
INSERT INTO timesheets (
    timesheet_id,
    user_id,
    date_of_issue,
    week_number,
    week_based_year,
    name,
    function,
    hours_worked,
    travel_expenses
)
SELECT
    'c5d6e7f8-9999-4d8a-0b1c-000000000015'::uuid,
    'f5c6d7e8-aaaa-4e9b-1c2d-000000000050'::uuid,
    '2025-07-29'::date,
    31,
    2025,
    'Eve Senior',
    'Manager',
    45.00,
    25.00
    WHERE NOT EXISTS (
    SELECT 1
    FROM timesheets
    WHERE timesheet_id = 'c5d6e7f8-9999-4d8a-0b1c-000000000015'::uuid
);

/* ---------- EXTRA WORK HISTORY ---------- */

/* Jane Doe (1111...) - multiple functions in ISO week 28 of 2025 */
INSERT INTO timesheets (
    timesheet_id,
    user_id,
    date_of_issue,
    week_number,
    week_based_year,
    name,
    function,
    hours_worked,
    travel_expenses
)
SELECT
    'aaaaaaaa-1111-1111-1111-000000000001'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '2025-07-07'::date,
    28,
    2025,
    'Jane Doe',
    'Runner Shift (Event A)',
    5.50,
    2.00
WHERE NOT EXISTS (
    SELECT 1 FROM timesheets WHERE timesheet_id = 'aaaaaaaa-1111-1111-1111-000000000001'::uuid
);

INSERT INTO timesheets (
    timesheet_id,
    user_id,
    date_of_issue,
    week_number,
    week_based_year,
    name,
    function,
    hours_worked,
    travel_expenses
)
SELECT
    'aaaaaaaa-1111-1111-1111-000000000002'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '2025-07-09'::date,
    28,
    2025,
    'Jane Doe',
    'Bar Shift (Evening)',
    6.25,
    3.50
WHERE NOT EXISTS (
    SELECT 1 FROM timesheets WHERE timesheet_id = 'aaaaaaaa-1111-1111-1111-000000000002'::uuid
);

INSERT INTO timesheets (
    timesheet_id,
    user_id,
    date_of_issue,
    week_number,
    week_based_year,
    name,
    function,
    hours_worked,
    travel_expenses
)
SELECT
    'aaaaaaaa-1111-1111-1111-000000000003'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '2025-07-11'::date,
    28,
    2025,
    'Jane Doe',
    'Setup & Teardown',
    4.00,
    0.00
WHERE NOT EXISTS (
    SELECT 1 FROM timesheets WHERE timesheet_id = 'aaaaaaaa-1111-1111-1111-000000000003'::uuid
);

/* Test User (auth seed userId) - ISO week 1 of 2026 */
INSERT INTO timesheets (
    timesheet_id,
    user_id,
    date_of_issue,
    week_number,
    week_based_year,
    name,
    function,
    hours_worked,
    travel_expenses
)
SELECT
    '223e4567-e89b-12d3-a456-426614174101'::uuid,
    '223e4567-e89b-12d3-a456-426614174006'::uuid,
    '2026-01-02'::date,
    1,
    2026,
    'Test User',
    'Bar Shift (Afternoon)',
    4.00,
    1.50
WHERE NOT EXISTS (
    SELECT 1 FROM timesheets WHERE timesheet_id = '223e4567-e89b-12d3-a456-426614174101'::uuid
);

INSERT INTO timesheets (
    timesheet_id,
    user_id,
    date_of_issue,
    week_number,
    week_based_year,
    name,
    function,
    hours_worked,
    travel_expenses
)
SELECT
    '223e4567-e89b-12d3-a456-426614174102'::uuid,
    '223e4567-e89b-12d3-a456-426614174006'::uuid,
    '2026-01-03'::date,
    1,
    2026,
    'Test User',
    'Runner Shift (Event B)',
    3.50,
    0.00
WHERE NOT EXISTS (
    SELECT 1 FROM timesheets WHERE timesheet_id = '223e4567-e89b-12d3-a456-426614174102'::uuid
);

/* User d5286a87-17ad-4d1d-8ed9-887c1d4a574c - bulk work history for testing */
UPDATE timesheets
SET date_of_issue = '2026-01-04'::date,
    week_number = 1,
    week_based_year = 2026
WHERE user_id = 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid;

INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '44ed3e80-2fac-5dcb-93b5-ac757b8e5ae0'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Runner Shift (Event A)', 5.50, 1.50
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '44ed3e80-2fac-5dcb-93b5-ac757b8e5ae0'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '0f4acde5-2c1b-51d9-bf68-48558fe125fe'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Bar Shift (Evening)', 6.25, 2.00
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '0f4acde5-2c1b-51d9-bf68-48558fe125fe'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '274c3f2a-7245-5c32-ab0a-435469457384'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Setup & Teardown', 3.75, 3.50
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '274c3f2a-7245-5c32-ab0a-435469457384'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '04c2f3e5-ec5c-55a9-b2f2-30314556affa'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Bar Shift (Afternoon)', 7.00, 0.00
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '04c2f3e5-ec5c-55a9-b2f2-30314556affa'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '0fa90961-a85d-5f47-a9e0-9eed9f4b81db'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Runner Shift (Event A)', 4.50, 1.50
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '0fa90961-a85d-5f47-a9e0-9eed9f4b81db'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '0ef8b3c9-84c4-5468-8825-435729ea0140'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Bar Shift (Evening)', 4.00, 2.00
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '0ef8b3c9-84c4-5468-8825-435729ea0140'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '95477afc-441b-5450-917d-6b18c83ef46b'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Setup & Teardown', 5.50, 3.50
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '95477afc-441b-5450-917d-6b18c83ef46b'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT 'eb2dab98-dcb2-5088-b127-a08dd1066084'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Bar Shift (Afternoon)', 6.25, 0.00
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = 'eb2dab98-dcb2-5088-b127-a08dd1066084'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT 'b51257f7-f16d-54ef-9395-ddbe76439c3a'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Runner Shift (Event A)', 3.75, 1.50
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = 'b51257f7-f16d-54ef-9395-ddbe76439c3a'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT 'e633e674-d56e-5dc2-8efe-b73eee940590'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Bar Shift (Evening)', 7.00, 2.00
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = 'e633e674-d56e-5dc2-8efe-b73eee940590'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '40d8f26d-3fc2-53f0-b8be-b644e074574d'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Setup & Teardown', 4.50, 3.50
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '40d8f26d-3fc2-53f0-b8be-b644e074574d'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT 'f65ba09b-2769-5fdd-b092-d7d27854e958'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Bar Shift (Afternoon)', 4.00, 0.00
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = 'f65ba09b-2769-5fdd-b092-d7d27854e958'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '3bfe0356-c5bd-5c59-9872-aa402edcfd5d'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Runner Shift (Event A)', 5.50, 1.50
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '3bfe0356-c5bd-5c59-9872-aa402edcfd5d'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT 'e1bcf9f8-ff88-5da6-b1ae-75f7a6505432'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Bar Shift (Evening)', 6.25, 2.00
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = 'e1bcf9f8-ff88-5da6-b1ae-75f7a6505432'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '8067c576-97e8-5669-98b8-99f525d863ec'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Setup & Teardown', 3.75, 3.50
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '8067c576-97e8-5669-98b8-99f525d863ec'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '46c1a11b-1493-5202-8e8a-c56634379cb6'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Bar Shift (Afternoon)', 7.00, 0.00
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '46c1a11b-1493-5202-8e8a-c56634379cb6'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '5f71c092-b057-54d4-bda4-0e1e0b652924'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Runner Shift (Event A)', 4.50, 1.50
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '5f71c092-b057-54d4-bda4-0e1e0b652924'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT 'e0d700a1-f72c-5dad-8b8e-5dc142b0561c'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Bar Shift (Evening)', 4.00, 2.00
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = 'e0d700a1-f72c-5dad-8b8e-5dc142b0561c'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '0d864de9-afd2-51aa-ae01-914872c548c2'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Setup & Teardown', 5.50, 3.50
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '0d864de9-afd2-51aa-ae01-914872c548c2'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT 'c72165ce-f2e5-5b0e-af4c-701baf2229d7'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Bar Shift (Afternoon)', 6.25, 0.00
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = 'c72165ce-f2e5-5b0e-af4c-701baf2229d7'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT 'd3c4fb9c-aa0a-5f85-b7f8-d03550136d28'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Runner Shift (Event A)', 3.75, 1.50
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = 'd3c4fb9c-aa0a-5f85-b7f8-d03550136d28'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '87a02203-26bc-58b9-8906-9961f4c28632'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Bar Shift (Evening)', 7.00, 2.00
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '87a02203-26bc-58b9-8906-9961f4c28632'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '6d4e52ab-d4a1-5e77-be4c-e6b3ecfa847d'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Setup & Teardown', 4.50, 3.50
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '6d4e52ab-d4a1-5e77-be4c-e6b3ecfa847d'::uuid);
INSERT INTO timesheets (timesheet_id, user_id, date_of_issue, week_number, week_based_year, name, function, hours_worked, travel_expenses)
SELECT '8bbfa649-c215-502b-9bed-87952bd57537'::uuid, 'd5286a87-17ad-4d1d-8ed9-887c1d4a574c'::uuid, '2026-01-04'::date, 1, 2026, 'Seed User', 'Bar Shift (Afternoon)', 4.00, 0.00
WHERE NOT EXISTS (SELECT 1 FROM timesheets WHERE timesheet_id = '8bbfa649-c215-502b-9bed-87952bd57537'::uuid);
