import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AdminAuditLog from "./AdminAuditLog";

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

describe("AdminAuditLog", () => {
    it("renders the audit log workspace heading and filter controls", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <AdminAuditLog />
            </MemoryRouter>
        );

        expect(html).toContain("Audit Log");
        expect(html).toContain("Review rule changes, approvals, assignments");
        expect(html).toContain("Filter on");
        expect(html).toContain("Search people, shifts, projects, or actions");
        expect(html).toContain("Add filter");
        expect(html).toContain("Reset filters");
        expect(html).toContain("Apply filters");
    });
});
