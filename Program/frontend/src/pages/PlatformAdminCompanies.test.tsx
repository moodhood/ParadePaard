import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PlatformAdminCompanies from "./PlatformAdminCompanies";

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

describe("PlatformAdminCompanies", () => {
    it("renders company rows with detail links", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <PlatformAdminCompanies
                    initialCompanies={[
                        {
                            companyId: "company-1",
                            name: "Acme Events",
                            payoutFrequencyMinutes: 10080,
                            timesheetLoggingMode: "ADMIN_FINALIZE",
                            travelClaimMode: "REQUIRES_APPROVAL",
                            totalUsers: 12,
                            activeUsers: 9,
                            pendingOnboardingReview: 2,
                        },
                    ]}
                />
            </MemoryRouter>
        );

        expect(html).toContain("Acme Events");
        expect(html).toContain("12 team members");
        expect(html).toContain("/platform/companies/company-1");
    });
});
