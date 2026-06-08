import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PlatformAdminHome from "./PlatformAdminHome";

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

vi.mock("../context/AuthContext", () => ({
    useAuth: () => ({
        permissions: ["CAN_MANAGE_PLATFORM"],
    }),
}));

describe("PlatformAdminHome", () => {
    it("renders company onboarding and companies as the first platform actions", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <PlatformAdminHome />
            </MemoryRouter>
        );

        expect(html).toContain("Company onboarding");
        expect(html).toContain("Companies");
        expect(html).toContain("/platform/companies");
    });
});
