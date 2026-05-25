import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import PageBack from "../components/PageBack";
import PrimaryNav from "../components/PrimaryNav";
import Card from "../components/common/Card";
import {
    calculateFinanceSummary,
    calculateShiftFinanceRecord,
    type FinanceSettings,
} from "../utils/payrollFinance";
import "../stylesheets/AdminDashboard.css";
import "../stylesheets/PayrollFinance.css";

const currencyFormatter = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const financeSettings: FinanceSettings = {
    minimumMarginPercentage: 18,
    sicknessRiskPercentage: 2,
    insuranceReservePercentage: 1,
    administrationCostPerHour: 1.25,
    overheadPercentage: 0,
    roundingRule: "TWO_DECIMALS",
    includeHolidayAllowanceInCost: true,
    includeVacationReservationInCost: true,
    includePensionInCost: true,
    lockAfterPayrollApproval: true,
};

const companyTaxReservePercentage = 2.5;

const initialFinanceRows = [
    calculateShiftFinanceRecord({
        id: "finance-bar-employee",
        shiftId: "shift-breda-evening",
        employeeId: "employee-ava",
        clientId: "client-brasserie",
        jobPresetId: "bar-employee",
        payrollRunId: "payroll-2026-01",
        shiftDate: "2026-01-18",
        clientName: "Brasserie De Markt",
        location: "Breda main bar",
        employeeName: "Ava Jansen",
        jobPresetName: "Bar employee",
        jobFunction: "Bar service and guest support",
        functionGroup: "I+II",
        contractType: "Part time",
        payrollPeriod: "Monthly",
        invoiceStatus: "UNPAID",
        workedHours: 6,
        employeeHourlyWage: 16.5,
        employeePayrollTaxWithheld: 18,
        pensionApplicable: true,
        clientBillingRatePerHour: 29.5,
        billingRateSource: "Custom shift rate",
        isBillingRateOverridden: true,
        billingRateOverrideReason: "Evening event rate agreed with client.",
        otherEmployerCosts: 0,
        isLocked: true,
        financeSettings,
        createdAt: "2026-01-18T10:00:00",
        updatedAt: "2026-01-18T10:00:00",
    }),
    calculateShiftFinanceRecord({
        id: "finance-runner",
        shiftId: "shift-breda-evening",
        employeeId: "employee-noah",
        clientId: "client-brasserie",
        jobPresetId: "runner",
        payrollRunId: "payroll-2026-01",
        shiftDate: "2026-01-18",
        clientName: "Brasserie De Markt",
        location: "Breda floor",
        employeeName: "Noah Bakker",
        jobPresetName: "Runner",
        jobFunction: "Floor support and clearing",
        functionGroup: "I+II",
        contractType: "Zero hours",
        payrollPeriod: "Monthly",
        invoiceStatus: "UNPAID",
        workedHours: 5,
        employeeHourlyWage: 14.71,
        employeePayrollTaxWithheld: 12.5,
        pensionApplicable: true,
        clientBillingRatePerHour: 26,
        billingRateSource: "Job preset default",
        otherEmployerCosts: 0,
        isLocked: true,
        financeSettings,
        createdAt: "2026-01-18T10:00:00",
        updatedAt: "2026-01-18T10:00:00",
    }),
    calculateShiftFinanceRecord({
        id: "finance-supervisor",
        shiftId: "shift-breda-evening",
        employeeId: "employee-sara",
        clientId: "client-brasserie",
        jobPresetId: "supervisor",
        payrollRunId: "payroll-2026-01",
        shiftDate: "2026-01-18",
        clientName: "Brasserie De Markt",
        location: "Breda floor",
        employeeName: "Sara Vermeer",
        jobPresetName: "Supervisor",
        jobFunction: "Shift coordination",
        functionGroup: "I+II",
        contractType: "Full time",
        payrollPeriod: "Monthly",
        invoiceStatus: "PAID",
        workedHours: 7,
        employeeHourlyWage: 20,
        employeePayrollTaxWithheld: 28,
        pensionApplicable: true,
        clientBillingRatePerHour: 38,
        billingRateSource: "Client default",
        otherEmployerCosts: 0,
        financeSettings,
        isLocked: true,
        createdAt: "2026-01-18T10:00:00",
        updatedAt: "2026-01-18T10:00:00",
    }),
    calculateShiftFinanceRecord({
        id: "finance-missing-rate",
        shiftId: "shift-rooftop-lunch",
        employeeId: "employee-lina",
        clientId: "client-rooftop",
        jobPresetId: "waiter",
        payrollRunId: "payroll-2026-01",
        shiftDate: "2026-01-22",
        clientName: "Rooftop Lunch",
        location: "Tilburg terrace",
        employeeName: "Lina Smit",
        jobPresetName: "Waiter",
        jobFunction: "Guest service",
        functionGroup: "I+II",
        contractType: "Part time",
        payrollPeriod: "Monthly",
        invoiceStatus: "UNPAID",
        workedHours: 4,
        employeeHourlyWage: 14.71,
        employeePayrollTaxWithheld: 9,
        pensionApplicable: true,
        clientBillingRatePerHour: null,
        billingRateSource: "Missing billing rate",
        otherEmployerCosts: 0,
        isLocked: true,
        financeSettings,
        createdAt: "2026-01-22T10:00:00",
        updatedAt: "2026-01-22T10:00:00",
    }),
];

function money(value: number): string {
    return currencyFormatter.format(value);
}

function pct(value: number): string {
    return `${numberFormatter.format(value)}%`;
}

function round2(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

export default function PayrollFinance() {
    const records = initialFinanceRows;
    const [selectedRunId, setSelectedRunId] = useState("payroll-2026-01");
    const summary = useMemo(() => calculateFinanceSummary(records), [records]);
    const companyTaxReserve = round2(summary.totalClientRevenue * (companyTaxReservePercentage / 100));
    const marginAfterCompanyTaxReserve = round2(summary.totalMarginBeforeOverhead - companyTaxReserve);
    const approvedRuns = useMemo(
        () => [
            {
                id: "payroll-2026-01",
                name: "January 2026 horeca payroll",
                period: "January 2026",
                approvedAt: "2026-01-31 14:20",
                approvedBy: "Finance lead",
                approvalStatus: "Approved after payroll run",
                lockStatus: "Finance values locked",
                records,
                summary,
                companyTaxReserve,
                marginAfterCompanyTaxReserve,
                adjustmentLog: [
                    {
                        label: "Billing rate override",
                        text: "Ava Jansen changed from job preset default to event rate before payroll approval.",
                    },
                    {
                        label: "Post approval changes",
                        text: "No post-approval unlocks or financial adjustments have been recorded.",
                    },
                ],
            },
        ],
        [companyTaxReserve, marginAfterCompanyTaxReserve, records, summary]
    );
    const selectedRun = approvedRuns.find((run) => run.id === selectedRunId) ?? approvedRuns[0];

    const summaryCards = [
        ["Total client revenue", money(summary.totalClientRevenue)],
        ["Total employee gross wages", money(summary.totalEmployeeGrossWages)],
        ["Total employer costs", money(summary.totalEmployerCosts)],
        ["Total payable to Belastingdienst", money(summary.totalPayableToBelastingdienst)],
        ["Total payable to pension fund", money(summary.totalPayableToPensionFund)],
        ["Total net wages paid", money(summary.totalNetWagesPaid)],
        ["Total margin before overhead", money(summary.totalMarginBeforeOverhead)],
        ["Average margin percentage", pct(summary.averageMarginPercentage)],
        ["Number of shifts missing billing rates", String(summary.missingBillingRateCount)],
        ["Number of shifts with negative margin", String(summary.negativeMarginCount)],
    ];
    const financeFlowSteps = [
        "Project is created by the employer or planning team.",
        "A shift is created and employees are assigned.",
        "A finance-permitted user sets the client billing rate from the client, project, job preset, shift, or employee assignment.",
        "The approved payroll run locks wage, tax, pension, contribution, and billing values.",
        "Payroll Finance shows client revenue, payroll obligations, company tax reserve, and margin after approval.",
    ];
    const financeSettingsRows = [
        ["Minimum margin percentage", pct(financeSettings.minimumMarginPercentage)],
        ["Sickness risk reserve", pct(financeSettings.sicknessRiskPercentage)],
        ["Insurance reserve", pct(financeSettings.insuranceReservePercentage)],
        ["Administration cost per hour", money(financeSettings.administrationCostPerHour)],
        ["Company tax reserve", `${pct(companyTaxReservePercentage)} internal reserve`],
        ["Finance lock", financeSettings.lockAfterPayrollApproval ? "Lock after payroll approval" : "Manual lock"],
    ];

    return (
        <>
            <Navbar />
            <div className="adminDashboardPage payrollFinancePage">
                <div className="pageShell">
                    <PrimaryNav />
                    <main className="pageShellContent">
                        <header className="pageHeader">
                            <PageBack to="/management" />
                            <div>
                                <h1 className="pageTitle">Payroll Finance</h1>
                                <p className="pageSubtitle">
                                    View shift billing, employer costs, client charges, and payroll margin.
                                </p>
                            </div>
                        </header>

                        <div className="payrollFinanceNotice">
                            Client billing rates and payroll margin are internal business values. They are not visible to
                            employees and are not determined by the Horeca CAO or the Belastingdienst.
                        </div>

                        <section className="payrollFinanceLayout">
                            <div className="payrollFinanceMain">
                                <Card title="Finance overview" className="payrollFinanceCard">
                                    <div className="payrollFinanceCardBody">
                                        <div className="financeSummaryGrid">
                                            {summaryCards.map(([label, value]) => (
                                                <div className="financeSummaryCard" key={label}>
                                                    <span>{label}</span>
                                                    <strong>{value}</strong>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="financeFlowText">
                                            This page starts after payroll approval. It summarizes locked finance values from
                                            approved payroll runs, including client revenue, employer costs, payroll payments,
                                            pension payments, company tax reserve, and margin.
                                        </div>
                                    </div>
                                </Card>

                                <Card title="Approved payroll runs" className="payrollFinanceCard">
                                    <div className="payrollFinanceCardBody">
                                        <div className="financeRunList">
                                            {approvedRuns.map((run) => (
                                                <article className="financeRunCard" key={run.id}>
                                                    <div>
                                                        <strong>{run.name}</strong>
                                                        <span>{run.period}</span>
                                                    </div>
                                                    <div>
                                                        <span>{run.approvalStatus}</span>
                                                        <strong>{run.approvedAt}</strong>
                                                    </div>
                                                    <div>
                                                        <span>{run.lockStatus}</span>
                                                        <strong>Approved by {run.approvedBy}</strong>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="button buttonSecondary"
                                                        onClick={() => setSelectedRunId(run.id)}
                                                    >
                                                        Open run breakdown
                                                    </button>
                                                </article>
                                            ))}
                                        </div>
                                    </div>
                                </Card>

                                <Card title="Revenue summary" className="payrollFinanceCard">
                                    <div className="payrollFinanceCardBody">
                                        <div className="financeFlowList">
                                            {financeFlowSteps.map((step) => (
                                                <div key={step}>{step}</div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>

                                <div className="financeSectionGrid">
                                    {[
                                        [
                                            "Payroll obligations",
                                            `Net wages paid to employees are ${money(summary.totalNetWagesPaid)}. Gross wage, employee tax withholding, and employee pension stay tied to approved payslips.`,
                                        ],
                                        [
                                            "Tax and contribution obligations",
                                            `Belastingdienst payment is ${money(summary.totalPayableToBelastingdienst)}. Pension fund payment is ${money(summary.totalPayableToPensionFund)}. Company tax reserve is ${money(companyTaxReserve)}.`,
                                        ],
                                        [
                                            "Margin summary",
                                            `Margin before overhead is ${money(summary.totalMarginBeforeOverhead)}. Margin after the internal company tax reserve is ${money(marginAfterCompanyTaxReserve)}.`,
                                        ],
                                        [
                                            "Margin calculation",
                                            "Margin before overhead equals client revenue minus total employer cost. Company tax reserve is an internal finance setting and is not a CAO or Belastingdienst source value.",
                                        ],
                                        [
                                            "Adjustment audit log",
                                            "Approved payroll finance is locked. If a finance user unlocks and changes a value after approval, the old value, new value, user, time, reason, and affected shift are recorded here.",
                                        ],
                                        [
                                            "Finance settings",
                                            "Configure margin target, sickness risk, insurance reserve, administration cost, company tax reserve, rounding, included cost categories, and finance lock behavior.",
                                        ],
                                    ].map(([title, text]) => (
                                        <Card title={title} className="payrollFinanceCard" key={title}>
                                            <div className="payrollFinanceCardBody">
                                                <p className="financeFlowText">{text}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {selectedRun ? (
                                <aside className="financeSidePanel">
                                    <div className="financeSidePanelHeader">
                                        <h2>{selectedRun.name}</h2>
                                        <span className="financeStatus financeStatus--healthy">
                                            Finance values locked
                                        </span>
                                    </div>
                                    <div className="financeBreakdownRows">
                                        <h3>Revenue summary</h3>
                                        <div><span>Client revenue</span><strong>{money(selectedRun.summary.totalClientRevenue)}</strong></div>
                                        <div><span>Total employer cost</span><strong>{money(selectedRun.summary.totalEmployerCosts)}</strong></div>
                                        <div><span>Margin before overhead</span><strong>{money(selectedRun.summary.totalMarginBeforeOverhead)}</strong></div>
                                        <div><span>Company tax reserve</span><strong>{money(selectedRun.companyTaxReserve)}</strong></div>
                                        <div><span>Margin after reserve</span><strong>{money(selectedRun.marginAfterCompanyTaxReserve)}</strong></div>
                                        <h3>Belastingdienst payment</h3>
                                        <div><span>Payroll tax and employer contributions</span><strong>{money(selectedRun.summary.totalPayableToBelastingdienst)}</strong></div>
                                        <h3>Pension payment</h3>
                                        <div><span>Employee and employer pension</span><strong>{money(selectedRun.summary.totalPayableToPensionFund)}</strong></div>
                                        <h3>Employee shift assignments</h3>
                                        {selectedRun.records.map((record) => (
                                            <div key={record.id}>
                                                <span>{record.employeeName} · {record.jobPresetName} · {numberFormatter.format(record.workedHours)} hours</span>
                                                <strong>{money(record.clientRevenue)} / {money(record.totalEmployerCost)}</strong>
                                            </div>
                                        ))}
                                        <h3>Finance settings</h3>
                                        {financeSettingsRows.map(([label, value]) => (
                                            <div key={label}><span>{label}</span><strong>{value}</strong></div>
                                        ))}
                                        <h3>Adjustment audit log</h3>
                                        {selectedRun.adjustmentLog.map((entry) => (
                                            <p key={entry.label}>
                                                <strong>{entry.label}:</strong> {entry.text}
                                            </p>
                                        ))}
                                        <h3>Source notes</h3>
                                        <p>
                                            Payroll source values come from the horeca CAO, wage table, Belastingdienst
                                            documents, and pension fund rules. Billing rates, reserves, overhead, and margin
                                            targets are internal finance settings.
                                        </p>
                                        {selectedRun.records.flatMap((record) => record.warnings).length > 0 ? (
                                            <div className="financeWarningList">
                                                {selectedRun.records.flatMap((record) => record.warnings).map((warning, index) => (
                                                    <span key={`${warning}-${index}`}>{warning}</span>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                </aside>
                            ) : null}
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
