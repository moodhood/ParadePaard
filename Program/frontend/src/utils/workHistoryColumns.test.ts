import { describe, expect, it } from "vitest";
import { getWorkHistoryColumns, getWorkHistoryFinanceStatus } from "./workHistoryColumns";

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
});
