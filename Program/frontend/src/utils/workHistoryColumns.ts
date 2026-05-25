export type WorkHistoryColumnKey =
    | "date"
    | "employee"
    | "shift"
    | "hours"
    | "travel"
    | "financeReadiness"
    | "billingRateSource"
    | "clientBillingRatePerHour"
    | "billingOverrideReason"
    | "financeLockStatus";

export type WorkHistoryColumn = {
    key: WorkHistoryColumnKey;
    label: string;
    financeOnly?: boolean;
    defaultVisible: boolean;
};

export type WorkHistoryColumnOptions = {
    showAllTimesheets: boolean;
    canViewFinanceColumns: boolean;
};

export type WorkHistoryFinancePreview = {
    clientBillingRatePerHour?: number | null;
    financeReviewNeeded?: boolean | null;
};

export const OPERATIONAL_WORK_HISTORY_COLUMNS: WorkHistoryColumn[] = [
    { key: "date", label: "Date", defaultVisible: true },
    { key: "employee", label: "Employee", defaultVisible: true },
    { key: "shift", label: "Shift", defaultVisible: true },
    { key: "hours", label: "Hours Worked", defaultVisible: true },
    { key: "travel", label: "Travel", defaultVisible: true },
    { key: "financeReadiness", label: "Finance readiness", defaultVisible: false },
];

export const FINANCE_WORK_HISTORY_COLUMNS: WorkHistoryColumn[] = [
    { key: "billingRateSource", label: "Billing rate source", financeOnly: true, defaultVisible: false },
    { key: "clientBillingRatePerHour", label: "Client billing rate per hour", financeOnly: true, defaultVisible: false },
    { key: "billingOverrideReason", label: "Billing override reason", financeOnly: true, defaultVisible: false },
    { key: "financeLockStatus", label: "Finance lock", financeOnly: true, defaultVisible: false },
];

export function getWorkHistoryColumns(options: WorkHistoryColumnOptions): WorkHistoryColumn[] {
    const operationalColumns = OPERATIONAL_WORK_HISTORY_COLUMNS.filter((column) => {
        return options.showAllTimesheets || column.key !== "employee";
    });

    return options.canViewFinanceColumns
        ? [...operationalColumns, ...FINANCE_WORK_HISTORY_COLUMNS]
        : operationalColumns;
}

export function getDefaultVisibleWorkHistoryColumns(options: WorkHistoryColumnOptions): WorkHistoryColumnKey[] {
    return getWorkHistoryColumns(options)
        .filter((column) => column.defaultVisible)
        .map((column) => column.key);
}

export function getWorkHistoryFinanceStatus(preview: WorkHistoryFinancePreview): string {
    if (preview.financeReviewNeeded) return "Finance review needed";
    if (preview.clientBillingRatePerHour == null) return "Billing rate missing";
    return "Billing rate set";
}
