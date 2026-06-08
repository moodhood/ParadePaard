import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { WorkHistoryColumn } from "../../utils/workHistoryColumns";
import {
    formatWorkHistoryColumnPickerSummary,
    WorkHistoryColumnPicker,
} from "./WorkHistoryColumnPicker";

const availableColumns: WorkHistoryColumn[] = [
    { key: "date", label: "Date", defaultVisible: true },
    { key: "employee", label: "Employee", defaultVisible: true },
    { key: "shift", label: "Shift", defaultVisible: true },
    { key: "hours", label: "Hours Worked", defaultVisible: true },
    { key: "travel", label: "Travel", defaultVisible: true },
    { key: "billingRateSource", label: "Billing rate source", defaultVisible: false, financeOnly: true },
];

describe("WorkHistoryColumnPicker", () => {
    it("summarizes the selected columns in the closed trigger", () => {
        const html = renderToStaticMarkup(
            <WorkHistoryColumnPicker
                availableColumns={availableColumns}
                visibleColumns={["date", "employee", "shift"]}
                onToggleColumn={vi.fn()}
            />
        );

        expect(html).toContain("Selected columns");
        expect(html).toContain("3 visible");
        expect(html).toContain("Date, Employee, Shift");
        expect(html).toContain('aria-expanded="false"');
        expect(html).not.toContain('type="checkbox"');
    });

    it("renders the selectable checkbox list inside the dropdown when opened", () => {
        const html = renderToStaticMarkup(
            <WorkHistoryColumnPicker
                availableColumns={availableColumns}
                visibleColumns={["date", "employee", "shift", "hours", "travel"]}
                onToggleColumn={vi.fn()}
                defaultOpen
            />
        );

        expect(html).toContain('aria-expanded="true"');
        expect(html).toContain("Finance columns are only available to users with payroll finance permission.");
        expect(html).toContain('type="checkbox"');
        expect(html).toContain("Billing rate source");
    });

    it("compacts long selected-column previews into a short summary", () => {
        expect(
            formatWorkHistoryColumnPickerSummary(
                ["date", "employee", "shift", "hours", "travel"],
                availableColumns
            )
        ).toEqual({
            countLabel: "5 visible",
            previewLabel: "Date, Employee, Shift +2 more",
        });
    });
});
