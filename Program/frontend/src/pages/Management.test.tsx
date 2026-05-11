import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Management from "./Management";

vi.mock("../context/AuthContext", () => ({
    useAuth: () => ({
        permissions: ["CAN_VIEW_USERS", "CAN_ONBOARD_USERS"],
    }),
}));

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

describe("Management", () => {
    it("does not render single-letter markers in management card headers", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <Management />
            </MemoryRouter>
        );

        expect(html).not.toContain("managementCardAccent");
    });
});
