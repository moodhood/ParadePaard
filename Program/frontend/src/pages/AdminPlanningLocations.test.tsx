import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AdminPlanningLocations from "./AdminPlanningLocations";

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

vi.mock("../components/PageBack", () => ({
    default: function MockPageBack() {
        return <a href="/management">Back to Management</a>;
    },
}));

describe("AdminPlanningLocations", () => {
    it("renders the planning locations workspace shell", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <AdminPlanningLocations />
            </MemoryRouter>
        );

        expect(html).toContain("Planning locations");
        expect(html).toContain("Add location");
        expect(html).toContain("Saved locations");
    });
});
