import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "./Navbar";

let permissions: string[] = [];

vi.mock("../context/AuthContext", () => ({
    useAuth: () => ({
        setStatus: vi.fn(),
        permissions,
        hasPermission: (permission: string) => permissions.includes(permission),
    }),
}));

describe("Navbar", () => {
    beforeEach(() => {
        permissions = [];
    });

    it("renders a top-left previous-page arrow", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(html).toContain('aria-label="Go to previous page"');
    });

    it("renders an admin message icon next to the account menu for message admins", () => {
        permissions = ["CAN_MANAGE_MESSAGES"];

        const html = renderToStaticMarkup(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(html).toContain('aria-label="Open shared admin inbox"');
        expect(html.indexOf('aria-label="Open shared admin inbox"')).toBeLessThan(
            html.indexOf('aria-label="Open user menu"')
        );
    });
});
