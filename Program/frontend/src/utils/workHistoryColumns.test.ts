import { describe, expect, it } from "vitest";
import { applyWorkHistoryFilters, type WorkHistoryFilterRow } from "./workHistoryFilters";
import {
    getWorkHistoryColumns,
    getWorkHistoryFinanceStatus,
    sanitizeVisibleWorkHistoryColumns,
} from "./workHistoryColumns";

describe("workHistoryColumns", () => {
    it("keeps finance values out of the work history columns without finance permission", () => {
        const columns = getWorkHistoryColumns({
            showAllTimesheets: true,
            canViewFinanceColumns: false,
        }).map((column) => column.key);

        expect(columns).toEqual(["date", "employee", "shift", "hours", "travel", "financeReadiness"]);
        expect(columns).not.toContain("clientBillingRatePerHour");
        expect(columns).not.toContain("marginStatus");
    });

    it("adds finance-only columns for users with payroll finance permission", () => {
        const columns = getWorkHistoryColumns({
            showAllTimesheets: true,
            canViewFinanceColumns: true,
        }).map((column) => column.key);

        expect(columns).toEqual(
            expect.arrayContaining([
                "financeReadiness",
                "billingRateSource",
                "clientBillingRatePerHour",
                "billingOverrideReason",
                "financeLockStatus",
            ])
        );
    });

    it("returns neutral finance readiness labels for operational users", () => {
        expect(getWorkHistoryFinanceStatus({ clientBillingRatePerHour: null })).toBe("Billing rate missing");
        expect(getWorkHistoryFinanceStatus({ clientBillingRatePerHour: 29.5 })).toBe("Billing rate set");
        expect(getWorkHistoryFinanceStatus({ financeReviewNeeded: true, clientBillingRatePerHour: 29.5 })).toBe(
            "Finance review needed"
        );
    });

    it("keeps saved visible columns limited to the columns available to the account", () => {
        const columns = getWorkHistoryColumns({
            showAllTimesheets: false,
            canViewFinanceColumns: false,
        });

        expect(
            sanitizeVisibleWorkHistoryColumns(
                ["employee", "shift", "clientBillingRatePerHour", "travel"],
                columns,
                ["date", "shift", "hours", "travel"]
            )
        ).toEqual(["shift", "travel"]);
    });

    it("falls back to default columns when a saved column setting has no available columns", () => {
        const columns = getWorkHistoryColumns({
            showAllTimesheets: true,
            canViewFinanceColumns: false,
        });

        expect(sanitizeVisibleWorkHistoryColumns(["clientBillingRatePerHour"], columns, ["date", "employee"])).toEqual([
            "date",
            "employee",
        ]);
    });

    it("filters work history rows by multiple manager-selected filter rows", () => {
        const filters: WorkHistoryFilterRow[] = [
            { id: "filter-1", field: "employee", value: "Ada" },
            { id: "filter-2", field: "minHours", value: "6" },
            { id: "filter-3", field: "dateFrom", value: "01/05/2026" },
        ];

        const rows = [
            {
                timesheetId: "1",
                userId: "user-1",
                name: "Ada Lovelace",
                dateOfIssue: "2026-05-02",
                function: "Bar",
                hoursWorked: 7,
                travelExpenses: 12,
            },
            {
                timesheetId: "2",
                userId: "user-2",
                name: "Grace Hopper",
                dateOfIssue: "2026-05-02",
                function: "Floor",
                hoursWorked: 8,
                travelExpenses: 0,
            },
            {
                timesheetId: "3",
                userId: "user-1",
                name: "Ada Lovelace",
                dateOfIssue: "2026-04-30",
                function: "Bar",
                hoursWorked: 9,
                travelExpenses: 4,
            },
        ];

        const filtered = applyWorkHistoryFilters(rows, filters, {
            getEmployeeName: (row) => row.name ?? row.userId ?? "",
            includeEmployeeFilters: true,
        });

        expect(filtered.map((row) => row.timesheetId)).toEqual(["1"]);
    });
});
