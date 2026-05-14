import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AdminUsers from "./AdminUsers";

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

describe("AdminUsers", () => {
    it("shows a generic arrow back control", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <AdminUsers />
            </MemoryRouter>
        );

        expect(html).toContain("Back");
    });
});
