export type SectorCode = "horeca";

export type PayrollRuleSource = {
    id: string;
    sourceName: string;
    documentName: string;
    sourceUrl: string;
    pageNumber: string;
    effectiveFrom: string;
    effectiveTo: string | null;
    sector: SectorCode;
    sourceType: "CAO" | "WAGE_TABLE" | "TAX_TABLE" | "TAX_RATES" | "PENSION_WEB_PAGE";
    sourceNote: string;
};

export type PayrollVariable = {
    id: string;
    sector: SectorCode;
    variableName: string;
    displayName: string;
    meaning: string;
    value: number | string | boolean;
    valueType: "PERCENTAGE" | "AMOUNT" | "HOURS" | "TEXT" | "BOOLEAN";
    unit: string;
    calculationRule: string;
    sourceId: string;
    pageNumber: string;
    sourceNote: string;
    usedInContract: boolean;
    usedInPayroll: boolean;
};

export type ContractType = "FULL_TIME" | "PART_TIME" | "ZERO_HOURS";
export type PayrollPeriod = "MONTHLY" | "WEEKLY" | "BIWEEKLY" | "FOUR_WEEKLY" | "EVERY_10_MINUTES";
export type HolidayAllowanceMode = "RESERVED" | "PAID_EACH_PERIOD";

export type JobPreset = {
    id: string;
    sector: SectorCode;
    presetName: string;
    jobTitle: string;
    jobFunction: string;
    functionGroup: string;
    defaultContractType: ContractType;
    defaultHourlyWage: number;
    defaultMonthlyWage: number;
    defaultHoursPerWeek: number;
    defaultPayrollPeriod: PayrollPeriod;
    pensionApplicable: boolean;
    holidayAllowanceMode: HolidayAllowanceMode;
    vacationBuildUpApplicable: boolean;
    sourceId: string;
    adminNotes: string;
    isActive: boolean;
};

export type ContractPayrollSettings = {
    id: string;
    employeeId: string;
    caoId: string;
    jobPresetId: string;
    contractType: ContractType;
    jobTitle: string;
    jobFunction: string;
    functionGroup: string;
    startDate: string;
    endDate: string | null;
    hoursPerWeek: number | null;
    payrollPeriod: PayrollPeriod;
    hourlyWage: number;
    monthlyWage: number | null;
    wageSourceId: string;
    isManualWageOverride: boolean;
    manualWageOverrideReason: string;
    loonheffingskorting: boolean | null;
    holidayAllowanceMode: HolidayAllowanceMode;
    pensionApplicable: boolean | null;
    pensionBase: string;
    awfType: "LOW" | "HIGH";
    aofType: "LOW" | "HIGH";
    whkSector: string;
    zvwApplicable: boolean;
};

export type HorecaWageRule = {
    id: string;
    year: number;
    effectiveFrom: string;
    effectiveTo: string | null;
    ageGroup: string;
    functionGroup: string;
    vakkrachtStatus: string;
    monthlyWage: number;
    weeklyWage: number;
    hourlyWage: number;
    sourceId: string;
    pageNumber: string;
};

export type EmployerPremiumRule = {
    id: string;
    year: number;
    premiumName: string;
    percentage: number;
    conditionName: string;
    sector: SectorCode | "all";
    maximumBase: number | null;
    sourceId: string;
    pageNumber: string;
};

export type CaoOption = {
    id: string;
    sector: SectorCode;
    name: string;
    effectiveFrom: string;
    effectiveTo: string;
    sourceId: string;
};

export const HORECA_CAO_OPTIONS: CaoOption[] = [
    {
        id: "horeca-cao-2025-2026",
        sector: "horeca",
        name: "Horeca CAO 2025 2026",
        effectiveFrom: "2025-01-01",
        effectiveTo: "2026-12-31",
        sourceId: "horeca-cao-2025-2026",
    },
];

export const HORECA_RULE_SOURCES: PayrollRuleSource[] = [
    {
        id: "horeca-cao-2025-2026",
        sourceName: "Koninklijke Horeca Nederland",
        documentName: "Horeca cao 2025 2026",
        sourceUrl: "https://static2.khn.nl/public/images/downloads/Horeca-cao-2025-2026_2024-12-30-142048_kgjp.pdf",
        pageNumber: "12, 23, 32",
        effectiveFrom: "2025-01-01",
        effectiveTo: "2026-12-31",
        sector: "horeca",
        sourceType: "CAO",
        sourceNote: "Used for normal working time, hourly wage formula, holiday allowance, vacation build-up, contract rules, and horeca employment conditions.",
    },
    {
        id: "loontabel-2026-01-01",
        sourceName: "Koninklijke Horeca Nederland",
        documentName: "Loontabel per 1 januari 2026",
        sourceUrl: "https://static2.khn.nl/public/images/downloads/Loontabel-per-1-januari-20261.pdf",
        pageNumber: "1",
        effectiveFrom: "2026-01-01",
        effectiveTo: "2026-12-31",
        sector: "horeca",
        sourceType: "WAGE_TABLE",
        sourceNote: "Used for horeca wage values by age, function group, hourly wage, weekly wage, and monthly wage.",
    },
    {
        id: "witte-maandloon-2026-01-01",
        sourceName: "Belastingdienst",
        documentName: "Witte Maandloon tabel loonbelasting premie volksverzekeringen Nederland Standaard 2026",
        sourceUrl: "https://download.belastingdienst.nl/belastingdienst/dl/rekenhulpen/loonheffing/2026/v01/pdf/wit_mnd_nl_std_20260101.pdf",
        pageNumber: "15",
        effectiveFrom: "2026-01-01",
        effectiveTo: "2026-12-31",
        sector: "horeca",
        sourceType: "TAX_TABLE",
        sourceNote: "Used for monthly wage tax withholding with or without loonheffingskorting.",
    },
    {
        id: "loonheffingen-tarieven-2026-01-01",
        sourceName: "Belastingdienst",
        documentName: "Tarieven, bedragen en percentages loonheffingen vanaf 1 januari 2026",
        sourceUrl: "https://download.belastingdienst.nl/belastingdienst/docs/bijlage-nieuwsbrief-loonheffingen-2026-lh2091b63fd.pdf",
        pageNumber: "3, 4, 10, 11, 12, 13",
        effectiveFrom: "2026-01-01",
        effectiveTo: "2026-12-31",
        sector: "horeca",
        sourceType: "TAX_RATES",
        sourceNote: "Used for annual brackets, tax credits, employer premiums, maximum premium wage, Zvw, AWf, Aof, Whk, and Wko.",
    },
    {
        id: "phenc-pensioenpremie",
        sourceName: "Pensioenfonds Horeca en Catering",
        documentName: "Pensioenpremie Pensioenfonds Horeca en Catering",
        sourceUrl: "https://www.phenc.nl/werkgever/pensioen-bij-ons/pensioenadministratie/pensioenpremie",
        pageNumber: "Web page",
        effectiveFrom: "2026-01-01",
        effectiveTo: null,
        sector: "horeca",
        sourceType: "PENSION_WEB_PAGE",
        sourceNote: "Used for total, employee, and employer horeca pension premium percentages.",
    },
];

export const HORECA_PAYROLL_VARIABLES: PayrollVariable[] = [
    {
        id: "normal-full-time-weekly-hours",
        sector: "horeca",
        variableName: "normalFullTimeWeeklyHours",
        displayName: "Full-time weekly hours",
        meaning: "Normal full-time working time for a horeca employee.",
        value: 38,
        valueType: "HOURS",
        unit: "hours per week",
        calculationRule: "Full-time standard from the CAO.",
        sourceId: "horeca-cao-2025-2026",
        pageNumber: "12",
        sourceNote: "Normal working time is 1,976 hours per reference period, averaging 38 hours per week.",
        usedInContract: true,
        usedInPayroll: true,
    },
    {
        id: "normal-full-time-monthly-hours",
        sector: "horeca",
        variableName: "normalFullTimeMonthlyHours",
        displayName: "Full-time monthly hours",
        meaning: "Monthly full-time hours used to convert monthly wage to hourly wage.",
        value: 164.67,
        valueType: "HOURS",
        unit: "hours per month",
        calculationRule: "1 / 164.67 of monthly wage equals the full-time hourly wage.",
        sourceId: "horeca-cao-2025-2026",
        pageNumber: "12",
        sourceNote: "The CAO states that the gross hourly wage is 1/164.67 of the monthly wage at full time.",
        usedInContract: true,
        usedInPayroll: true,
    },
    {
        id: "holiday-allowance-percentage",
        sector: "horeca",
        variableName: "holidayAllowancePercentage",
        displayName: "Holiday allowance",
        meaning: "Holiday allowance percentage over earned wage.",
        value: 8,
        valueType: "PERCENTAGE",
        unit: "percent",
        calculationRule: "Gross wage x 8%.",
        sourceId: "horeca-cao-2025-2026",
        pageNumber: "32",
        sourceNote: "The CAO gives employees the right to 8 percent holiday allowance.",
        usedInContract: true,
        usedInPayroll: true,
    },
    {
        id: "vacation-build-up-total",
        sector: "horeca",
        variableName: "vacationBuildUpPerPaidHour",
        displayName: "Vacation build-up",
        meaning: "Vacation hours built up for each paid hour.",
        value: 0.0961,
        valueType: "HOURS",
        unit: "vacation hour per paid hour",
        calculationRule: "Paid hours x 0.0961.",
        sourceId: "horeca-cao-2025-2026",
        pageNumber: "23",
        sourceNote: "0.0769 legal vacation hour plus 0.0192 extra vacation hour per paid hour.",
        usedInContract: true,
        usedInPayroll: true,
    },
    {
        id: "payroll-tax-with-credit-example",
        sector: "horeca",
        variableName: "monthlyPayrollTaxWithCreditAt2425_50",
        displayName: "Payroll tax with loonheffingskorting",
        meaning: "Example monthly withholding for a younger-than-AOW employee around EUR 2,425.50 table wage.",
        value: 160.5,
        valueType: "AMOUNT",
        unit: "EUR",
        calculationRule: "Monthly wage tax table row for table wage EUR 2,425.50 with loonheffingskorting.",
        sourceId: "witte-maandloon-2026-01-01",
        pageNumber: "15",
        sourceNote: "Example value for the documented example calculation, not a universal tax calculation.",
        usedInContract: false,
        usedInPayroll: true,
    },
    {
        id: "payroll-tax-without-credit-example",
        sector: "horeca",
        variableName: "monthlyPayrollTaxWithoutCreditAt2425_50",
        displayName: "Payroll tax without loonheffingskorting",
        meaning: "Example monthly withholding for a younger-than-AOW employee around EUR 2,425.50 table wage.",
        value: 867.08,
        valueType: "AMOUNT",
        unit: "EUR",
        calculationRule: "Monthly wage tax table row for table wage EUR 2,425.50 without loonheffingskorting.",
        sourceId: "witte-maandloon-2026-01-01",
        pageNumber: "15",
        sourceNote: "Example value for the documented example calculation, not a universal tax calculation.",
        usedInContract: false,
        usedInPayroll: true,
    },
    {
        id: "pension-premium-total",
        sector: "horeca",
        variableName: "pensionPremiumTotal",
        displayName: "Pension premium total",
        meaning: "Total basic pension premium.",
        value: 16.8,
        valueType: "PERCENTAGE",
        unit: "percent",
        calculationRule: "Pension base x 16.8%.",
        sourceId: "phenc-pensioenpremie",
        pageNumber: "Web page",
        sourceNote: "Total basic pension premium split between employee and employer.",
        usedInContract: true,
        usedInPayroll: true,
    },
    {
        id: "pension-premium-employee",
        sector: "horeca",
        variableName: "pensionPremiumEmployee",
        displayName: "Employee pension premium",
        meaning: "Employee part of the basic pension premium.",
        value: 8.4,
        valueType: "PERCENTAGE",
        unit: "percent",
        calculationRule: "Pension base x 8.4%.",
        sourceId: "phenc-pensioenpremie",
        pageNumber: "Web page",
        sourceNote: "Employee part of the horeca pension premium.",
        usedInContract: true,
        usedInPayroll: true,
    },
    {
        id: "pension-premium-employer",
        sector: "horeca",
        variableName: "pensionPremiumEmployer",
        displayName: "Employer pension premium",
        meaning: "Employer part of the basic pension premium.",
        value: 8.4,
        valueType: "PERCENTAGE",
        unit: "percent",
        calculationRule: "Pension base x 8.4%.",
        sourceId: "phenc-pensioenpremie",
        pageNumber: "Web page",
        sourceNote: "Employer part of the horeca pension premium.",
        usedInContract: true,
        usedInPayroll: true,
    },
    {
        id: "maximum-premium-wage-month",
        sector: "horeca",
        variableName: "maximumPremiumWageMonth",
        displayName: "Maximum premium wage per month",
        meaning: "Monthly maximum base for employee insurance premiums and Zvw.",
        value: 6617.41,
        valueType: "AMOUNT",
        unit: "EUR",
        calculationRule: "Employer premiums are capped at this monthly base.",
        sourceId: "loonheffingen-tarieven-2026-01-01",
        pageNumber: "12",
        sourceNote: "Monthly loontijdvak maximum for employee insurance premiums and Zvw.",
        usedInContract: false,
        usedInPayroll: true,
    },
    {
        id: "maximum-premium-wage-year",
        sector: "horeca",
        variableName: "maximumPremiumWageYear",
        displayName: "Maximum premium wage per year",
        meaning: "Annual maximum base for employee insurance premiums and Zvw.",
        value: 79409,
        valueType: "AMOUNT",
        unit: "EUR",
        calculationRule: "Employer premiums are capped at this annual base.",
        sourceId: "loonheffingen-tarieven-2026-01-01",
        pageNumber: "12",
        sourceNote: "Annual loontijdvak maximum for employee insurance premiums and Zvw.",
        usedInContract: false,
        usedInPayroll: true,
    },
];

export const HORECA_WAGE_RULES: HorecaWageRule[] = [
    {
        id: "horeca-2026-adult-function-group-i-ii",
        year: 2026,
        effectiveFrom: "2026-01-01",
        effectiveTo: "2026-12-31",
        ageGroup: "Adult",
        functionGroup: "I+II",
        vakkrachtStatus: "Vakkracht or adult employee",
        monthlyWage: 2422.25,
        weeklyWage: 559.0,
        hourlyWage: 14.71,
        sourceId: "loontabel-2026-01-01",
        pageNumber: "1",
    },
];

export const HORECA_EMPLOYER_PREMIUM_RULES: EmployerPremiumRule[] = [
    {
        id: "awf-low-2026",
        year: 2026,
        premiumName: "AWf low",
        percentage: 2.74,
        conditionName: "Low AWf premium",
        sector: "all",
        maximumBase: 6617.41,
        sourceId: "loonheffingen-tarieven-2026-01-01",
        pageNumber: "10",
    },
    {
        id: "awf-high-2026",
        year: 2026,
        premiumName: "AWf high",
        percentage: 7.74,
        conditionName: "High AWf premium",
        sector: "all",
        maximumBase: 6617.41,
        sourceId: "loonheffingen-tarieven-2026-01-01",
        pageNumber: "10",
    },
    {
        id: "aof-low-2026",
        year: 2026,
        premiumName: "Aof low",
        percentage: 6.27,
        conditionName: "Low Aof premium",
        sector: "all",
        maximumBase: 6617.41,
        sourceId: "loonheffingen-tarieven-2026-01-01",
        pageNumber: "10",
    },
    {
        id: "aof-high-2026",
        year: 2026,
        premiumName: "Aof high",
        percentage: 7.63,
        conditionName: "High Aof premium",
        sector: "all",
        maximumBase: 6617.41,
        sourceId: "loonheffingen-tarieven-2026-01-01",
        pageNumber: "10",
    },
    {
        id: "whk-small-horeca-33-2026",
        year: 2026,
        premiumName: "Whk sector 33 Horeca algemeen",
        percentage: 1.77,
        conditionName: "Small employer sector 33 Horeca algemeen, WGA 0.88% and ZW flex 0.89%",
        sector: "horeca",
        maximumBase: 6617.41,
        sourceId: "loonheffingen-tarieven-2026-01-01",
        pageNumber: "11",
    },
    {
        id: "wko-surcharge-2026",
        year: 2026,
        premiumName: "Wko surcharge",
        percentage: 0.5,
        conditionName: "Childcare surcharge",
        sector: "all",
        maximumBase: 6617.41,
        sourceId: "loonheffingen-tarieven-2026-01-01",
        pageNumber: "10",
    },
    {
        id: "zvw-employer-2026",
        year: 2026,
        premiumName: "Employer Zvw contribution",
        percentage: 6.1,
        conditionName: "Employer Zvw contribution applies",
        sector: "all",
        maximumBase: 6617.41,
        sourceId: "loonheffingen-tarieven-2026-01-01",
        pageNumber: "13",
    },
];

export const DEFAULT_HORECA_JOB_PRESETS: JobPreset[] = [
    {
        id: "bar-employee",
        sector: "horeca",
        presetName: "Bar employee",
        jobTitle: "Bar employee",
        jobFunction: "Bar service and guest support",
        functionGroup: "I+II",
        defaultContractType: "PART_TIME",
        defaultHourlyWage: 14.71,
        defaultMonthlyWage: 2422.25,
        defaultHoursPerWeek: 24,
        defaultPayrollPeriod: "MONTHLY",
        pensionApplicable: true,
        holidayAllowanceMode: "RESERVED",
        vacationBuildUpApplicable: true,
        sourceId: "loontabel-2026-01-01",
        adminNotes: "Reusable horeca preset for standard bar work. Adjust wage upward when agreed commercially.",
        isActive: true,
    },
    {
        id: "runner",
        sector: "horeca",
        presetName: "Runner",
        jobTitle: "Runner",
        jobFunction: "Floor support, clearing, serving support, and stock movement",
        functionGroup: "I+II",
        defaultContractType: "ZERO_HOURS",
        defaultHourlyWage: 14.71,
        defaultMonthlyWage: 2422.25,
        defaultHoursPerWeek: 0,
        defaultPayrollPeriod: "MONTHLY",
        pensionApplicable: true,
        holidayAllowanceMode: "RESERVED",
        vacationBuildUpApplicable: true,
        sourceId: "loontabel-2026-01-01",
        adminNotes: "Zero-hours preset for flexible floor support.",
        isActive: true,
    },
    {
        id: "waiter",
        sector: "horeca",
        presetName: "Waiter",
        jobTitle: "Waiter",
        jobFunction: "Guest service, ordering, serving, and section care",
        functionGroup: "I+II",
        defaultContractType: "PART_TIME",
        defaultHourlyWage: 14.71,
        defaultMonthlyWage: 2422.25,
        defaultHoursPerWeek: 24,
        defaultPayrollPeriod: "MONTHLY",
        pensionApplicable: true,
        holidayAllowanceMode: "RESERVED",
        vacationBuildUpApplicable: true,
        sourceId: "loontabel-2026-01-01",
        adminNotes: "Preset for general restaurant service work.",
        isActive: true,
    },
    {
        id: "kitchen-help",
        sector: "horeca",
        presetName: "Kitchen help",
        jobTitle: "Kitchen help",
        jobFunction: "Kitchen support, prep work, dish handling, and cleaning",
        functionGroup: "I+II",
        defaultContractType: "PART_TIME",
        defaultHourlyWage: 14.71,
        defaultMonthlyWage: 2422.25,
        defaultHoursPerWeek: 24,
        defaultPayrollPeriod: "MONTHLY",
        pensionApplicable: true,
        holidayAllowanceMode: "RESERVED",
        vacationBuildUpApplicable: true,
        sourceId: "loontabel-2026-01-01",
        adminNotes: "Preset for basic kitchen support.",
        isActive: true,
    },
    {
        id: "supervisor",
        sector: "horeca",
        presetName: "Supervisor",
        jobTitle: "Supervisor",
        jobFunction: "Shift coordination, team support, and service quality control",
        functionGroup: "I+II",
        defaultContractType: "FULL_TIME",
        defaultHourlyWage: 15.75,
        defaultMonthlyWage: 2593.55,
        defaultHoursPerWeek: 38,
        defaultPayrollPeriod: "MONTHLY",
        pensionApplicable: true,
        holidayAllowanceMode: "RESERVED",
        vacationBuildUpApplicable: true,
        sourceId: "loontabel-2026-01-01",
        adminNotes: "Above-CAO preset for a supervising role until a higher function group table is added.",
        isActive: true,
    },
];
