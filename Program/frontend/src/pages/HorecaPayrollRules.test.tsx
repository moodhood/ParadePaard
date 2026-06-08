import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import HorecaPayrollRules from "./HorecaPayrollRules";

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

describe("HorecaPayrollRules", () => {
    it("renders the streamlined horeca payroll sections", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <HorecaPayrollRules />
            </MemoryRouter>
        );

        [
            "Wage rules",
            "Tax and payroll rules",
            "Pension rules",
            "Holiday and travel rules",
            "Example contract population",
            "Horeca CAO source documents",
        ].forEach((sectionTitle) => {
            expect(html).toContain(sectionTitle);
        });

        ["Overview", "Contract settings", "Payroll calculator", "Source details"].forEach((sectionTitle) => {
            expect(html).not.toContain(sectionTitle);
        });
    });

    it("renders section edit actions without the inline editor", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <HorecaPayrollRules />
            </MemoryRouter>
        );

        expect(html).toContain('aria-label="Edit wage rules"');
        expect(html).toContain('aria-label="Edit tax and payroll rules"');
        expect(html).toContain('aria-label="Edit pension rules"');
        expect(html).toContain('aria-label="Edit holiday and travel rules"');
        expect(html).not.toContain("Clear form");
    });

    it("places the example contract population before the rule sections and source documents last", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <HorecaPayrollRules />
            </MemoryRouter>
        );

        const exampleIndex = html.indexOf("Example contract population");
        const wageRulesIndex = html.indexOf("Wage rules");
        const sourceDocumentsIndex = html.indexOf("Horeca CAO source documents");

        expect(exampleIndex).toBeGreaterThanOrEqual(0);
        expect(wageRulesIndex).toBeGreaterThan(exampleIndex);
        expect(sourceDocumentsIndex).toBeGreaterThan(wageRulesIndex);
    });

    it("replaces inline source-detail buttons with direct source links in the visible page content", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <HorecaPayrollRules />
            </MemoryRouter>
        );

        expect(html).toContain("href=\"https://static2.khn.nl/public/images/downloads/Loontabel-per-1-januari-20261.pdf\"");
        expect(html).toContain("href=\"https://www.phenc.nl/werkgever/pensioen-bij-ons/pensioenadministratie/pensioenpremie\"");
        expect(html).not.toContain("aria-label=\"Source details\"");
    });

    it("shows the wage rules as age-group and function-group rows instead of a single adult rate", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <HorecaPayrollRules />
            </MemoryRouter>
        );

        expect(html).toContain("Age group");
        expect(html).toContain("Function group");
        expect(html).toContain("Adult (21+)");
        expect(html).toContain("I+II");
        expect(html).toContain("managed wage rows");
    });
});
