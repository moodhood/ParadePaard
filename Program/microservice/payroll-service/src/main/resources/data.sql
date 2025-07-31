-- ensure payslips table
CREATE TABLE IF NOT EXISTS payslips (
                                        id UUID PRIMARY KEY,
                                        user_id UUID NOT NULL,
                                        period_start DATE NOT NULL,
                                        period_end DATE NOT NULL,
                                        gross_base_amount NUMERIC(19,4),
    vacation_hours NUMERIC,
    vacation_pay_amount NUMERIC(19,4),
    total_gross NUMERIC(19,4),
    pension_base_amount NUMERIC(19,4),
    wage_tax_withheld NUMERIC(19,4),
    social_security_withheld NUMERIC(19,4),
    heffingskorting_applied BOOLEAN,
    labor_tax_credit_amount NUMERIC(19,4),
    net_amount NUMERIC(19,4),
    payslip_document_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
    );

-- ensure extra items table
CREATE TABLE IF NOT EXISTS payslip_extra_items (
                                                   payslip_id UUID NOT NULL,
                                                   item_key VARCHAR(100) NOT NULL,
    item_value NUMERIC(19,4),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (payslip_id, item_key)
    );

-- Alice Brown payslip
INSERT INTO payslips (id, user_id, period_start, period_end, gross_base_amount, vacation_hours, vacation_pay_amount, total_gross, pension_base_amount, wage_tax_withheld, social_security_withheld, heffingskorting_applied, labor_tax_credit_amount, net_amount, payslip_document_id)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
       '11111111-1111-1111-1111-111111111111',
       '2025-07-01',
       '2025-07-31',
       5000.0000,
       8.0,
       333.3333,
       5333.3333,
       250.0000,
       900.0000,
       200.0000,
       true,
       120.0000,
       4113.3333,
       'dddddddd-dddd-dddd-dddd-000000000001'
    WHERE NOT EXISTS (SELECT 1 FROM payslips WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001');

INSERT INTO payslip_extra_items (payslip_id, item_key, item_value, note)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001', 'one_time_travel_allowance', 125.5000, 'Conference travel reimbursement'
    WHERE NOT EXISTS (SELECT 1 FROM payslip_extra_items WHERE payslip_id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001' AND item_key = 'one_time_travel_allowance');

INSERT INTO payslip_extra_items (payslip_id, item_key, item_value, note)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001', 'performance_bonus', 250.0000, 'Monthly performance bonus'
    WHERE NOT EXISTS (SELECT 1 FROM payslip_extra_items WHERE payslip_id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001' AND item_key = 'performance_bonus');

-- Bob Adams payslip
INSERT INTO payslips (id, user_id, period_start, period_end, gross_base_amount, vacation_hours, vacation_pay_amount, total_gross, pension_base_amount, wage_tax_withheld, social_security_withheld, heffingskorting_applied, labor_tax_credit_amount, net_amount, payslip_document_id)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-000000000002',
       '11111111-1111-1111-1111-222222222222',
       '2025-07-01',
       '2025-07-31',
       7000.0000,
       10.0,
       466.6667,
       7466.6667,
       350.0000,
       1260.0000,
       300.0000,
       false,
       0.0000,
       5556.6667,
       'dddddddd-dddd-dddd-dddd-000000000002'
    WHERE NOT EXISTS (SELECT 1 FROM payslips WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000002');

INSERT INTO payslip_extra_items (payslip_id, item_key, item_value, note)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-000000000002', 'equipment_reimbursement', 75.0000, 'Home office setup'
    WHERE NOT EXISTS (SELECT 1 FROM payslip_extra_items WHERE payslip_id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000002' AND item_key = 'equipment_reimbursement');

INSERT INTO payslip_extra_items (payslip_id, item_key, item_value, note)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-000000000002', 'late_fee_credit', 50.0000, 'Correction for previous period'
    WHERE NOT EXISTS (SELECT 1 FROM payslip_extra_items WHERE payslip_id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000002' AND item_key = 'late_fee_credit');

-- Carol Chen payslip
INSERT INTO payslips (id, user_id, period_start, period_end, gross_base_amount, vacation_hours, vacation_pay_amount, total_gross, pension_base_amount, wage_tax_withheld, social_security_withheld, heffingskorting_applied, labor_tax_credit_amount, net_amount, payslip_document_id)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
       '11111111-1111-1111-1111-333333333333',
       '2025-07-01',
       '2025-07-31',
       6200.0000,
       9.0,
       413.3333,
       6613.3333,
       300.0000,
       1116.0000,
       260.0000,
       true,
       100.0000,
       5137.3333,
       'dddddddd-dddd-dddd-dddd-000000000003'
    WHERE NOT EXISTS (SELECT 1 FROM payslips WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000003');

INSERT INTO payslip_extra_items (payslip_id, item_key, item_value, note)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-000000000003', 'transport_allowance', 60.0000, 'Monthly travel stipend'
    WHERE NOT EXISTS (SELECT 1 FROM payslip_extra_items WHERE payslip_id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000003' AND item_key = 'transport_allowance');

INSERT INTO payslip_extra_items (payslip_id, item_key, item_value, note)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-000000000003', 'wellness_credit', 40.0000, 'Gym membership subsidy'
    WHERE NOT EXISTS (SELECT 1 FROM payslip_extra_items WHERE payslip_id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000003' AND item_key = 'wellness_credit');

-- Dan Evans payslip
INSERT INTO payslips (id, user_id, period_start, period_end, gross_base_amount, vacation_hours, vacation_pay_amount, total_gross, pension_base_amount, wage_tax_withheld, social_security_withheld, heffingskorting_applied, labor_tax_credit_amount, net_amount, payslip_document_id)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-000000000004',
       '11111111-1111-1111-1111-444444444444',
       '2025-07-01',
       '2025-07-31',
       8000.0000,
       12.0,
       533.3333,
       8533.3333,
       400.0000,
       1440.0000,
       320.0000,
       false,
       0.0000,
       6373.3333,
       'dddddddd-dddd-dddd-dddd-000000000004'
    WHERE NOT EXISTS (SELECT 1 FROM payslips WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000004');

INSERT INTO payslip_extra_items (payslip_id, item_key, item_value, note)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-000000000004', 'project_bonus', 500.0000, 'Completed major milestone'
    WHERE NOT EXISTS (SELECT 1 FROM payslip_extra_items WHERE payslip_id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000004' AND item_key = 'project_bonus');

INSERT INTO payslip_extra_items (payslip_id, item_key, item_value, note)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-000000000004', 'meal_allowance', 120.0000, 'Client dinner'
    WHERE NOT EXISTS (SELECT 1 FROM payslip_extra_items WHERE payslip_id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000004' AND item_key = 'meal_allowance');

-- Ella Fisher payslip
INSERT INTO payslips (id, user_id, period_start, period_end, gross_base_amount, vacation_hours, vacation_pay_amount, total_gross, pension_base_amount, wage_tax_withheld, social_security_withheld, heffingskorting_applied, labor_tax_credit_amount, net_amount, payslip_document_id)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-000000000005',
       '22222222-2222-2222-2222-111111111111',
       '2025-07-01',
       '2025-07-31',
       4800.0000,
       7.0,
       320.0000,
       5120.0000,
       220.0000,
       864.0000,
       192.0000,
       true,
       90.0000,
       3874.0000,
       'dddddddd-dddd-dddd-dddd-000000000005'
    WHERE NOT EXISTS (SELECT 1 FROM payslips WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000005');

INSERT INTO payslip_extra_items (payslip_id, item_key, item_value, note)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-000000000005', 'training_reimbursement', 200.0000, 'Certification course fee'
    WHERE NOT EXISTS (SELECT 1 FROM payslip_extra_items WHERE payslip_id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000005' AND item_key = 'training_reimbursement');

INSERT INTO payslip_extra_items (payslip_id, item_key, item_value, note)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-000000000005', 'equipment_stipend', 80.0000, 'Keyboard and mouse'
    WHERE NOT EXISTS (SELECT 1 FROM payslip_extra_items WHERE payslip_id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000005' AND item_key = 'equipment_stipend');
