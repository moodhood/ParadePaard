import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PayrollFinance from "./PayrollFinance";

vi.mock("../components/Navbar", () => ({
    default: function MockNavbar() {
        return <nav aria-label="Navbar" />;
    },
}));

vi.mock("../components/PrimaryNav", () => ({
    default: function MockPrimaryNav() {
        return <nav aria-label="Primary navigation" />;
    },
}));

describe("PayrollFinance", () => {
    it("renders the approved payroll finance sections and employee-hidden notice", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <PayrollFinance />
            </MemoryRouter>
        );

        [
            "Finance overview",
            "Approved payroll runs",
            "Revenue summary",
            "Payroll obligations",
            "Tax and contribution obligations",
            "Margin summary",
            "Margin calculation",
            "Adjustment audit log",
            "Finance settings",
        ].forEach((sectionTitle) => {
            expect(html).toContain(sectionTitle);
        });

        expect(html).not.toContain("Shift billing rates");
        expect(html).not.toContain("Finance history per shift");
        expect(html).toContain("Client billing rates and payroll margin are internal business values.");
        expect(html).toContain("not visible to employees");
    });

    it("shows locked approved run summaries and drilldown actions instead of inline rate editing", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <PayrollFinance />
            </MemoryRouter>
        );

        expect(html).toContain("Total client revenue");
        expect(html).toContain("Total employer costs");
        expect(html).toContain("Total payable to Belastingdienst");
        expect(html).toContain("Number of shifts missing billing rates");
        expect(html).toContain("Approved after payroll run");
        expect(html).toContain("Finance values locked");
        expect(html).toContain("Open run breakdown");
        expect(html).not.toContain("Bulk update billing rates");
        expect(html).toContain("Margin before overhead");
    });
});
