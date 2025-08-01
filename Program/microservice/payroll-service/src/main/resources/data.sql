CREATE TABLE IF NOT EXISTS payslips
(
    payslip_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_base_amount NUMERIC(19,4),
    vacation_hours NUMERIC(19,4),
    vacation_pay_amount NUMERIC(19,4),
    other_special_remuneration TEXT,
    total_gross NUMERIC(19,4),
    pension_base_amount NUMERIC(19,4),
    wage_tax_withheld NUMERIC(19,4),
    social_security_withheld NUMERIC(19,4),
    heffingskorting_applied BOOLEAN,
    labor_tax_credit_amount NUMERIC(19,4),
    net_amount NUMERIC(19,4),
    payslip_document_id UUID
    );

CREATE TABLE IF NOT EXISTS payslip_extra_items
(
    payslip_id UUID NOT NULL,
    item_key VARCHAR(255) NOT NULL,
    item_value NUMERIC(19,4),
    description TEXT,
    PRIMARY KEY (payslip_id, item_key)
    );

INSERT INTO payslips (
    payslip_id, user_id, period_start, period_end, gross_base_amount,
    vacation_hours, vacation_pay_amount, other_special_remuneration,
    total_gross, pension_base_amount, wage_tax_withheld,
    social_security_withheld, heffingskorting_applied,
    labor_tax_credit_amount, net_amount, payslip_document_id
)
SELECT '11111111-1111-1111-1111-111111111111',
       '22222222-2222-2222-2222-222222222222',
       '2025-06-01', '2025-06-30', 3000.00,
       8.0, 240.00, 'Bonus June',
       3240.00, 1000.00, 400.00,
       250.00, TRUE, 200.00, 2390.00, 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1'
    WHERE NOT EXISTS (SELECT 1 FROM payslips WHERE payslip_id = '11111111-1111-1111-1111-111111111111');

INSERT INTO payslips (
    payslip_id, user_id, period_start, period_end, gross_base_amount,
    vacation_hours, vacation_pay_amount, other_special_remuneration,
    total_gross, pension_base_amount, wage_tax_withheld,
    social_security_withheld, heffingskorting_applied,
    labor_tax_credit_amount, net_amount, payslip_document_id
)
SELECT '33333333-3333-3333-3333-333333333333',
       '44444444-4444-4444-4444-444444444444',
       '2025-07-01', '2025-07-31', 2800.00,
       6.0, 200.00, 'Holiday pay',
       3000.00, 950.00, 350.00,
       230.00, FALSE, 180.00, 2240.00, 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2'
    WHERE NOT EXISTS (SELECT 1 FROM payslips WHERE payslip_id = '33333333-3333-3333-3333-333333333333');

INSERT INTO payslip_extra_items (payslip_id, item_key, item_value, description)
SELECT '11111111-1111-1111-1111-111111111111', 'car_allowance', 100.00, 'Company car allowance for June'
    WHERE NOT EXISTS (
        SELECT 1 FROM payslip_extra_items
        WHERE payslip_id = '11111111-1111-1111-1111-111111111111' AND item_key = 'car_allowance'
    );

INSERT INTO payslip_extra_items (payslip_id, item_key, item_value, description)
SELECT '11111111-1111-1111-1111-111111111111', 'meal_voucher', 50.00, 'Lunch voucher'
    WHERE NOT EXISTS (
        SELECT 1 FROM payslip_extra_items
        WHERE payslip_id = '11111111-1111-1111-1111-111111111111' AND item_key = 'meal_voucher'
    );

INSERT INTO payslip_extra_items (payslip_id, item_key, item_value, description)
SELECT '33333333-3333-3333-3333-333333333333', 'overtime_bonus', 120.00, 'Bonus for overtime hours'
    WHERE NOT EXISTS (
        SELECT 1 FROM payslip_extra_items
        WHERE payslip_id = '33333333-3333-3333-3333-333333333333' AND item_key = 'overtime_bonus'
    );
