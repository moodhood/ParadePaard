import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Navbar from "./Navbar";

vi.mock("../context/AuthContext", () => ({
    useAuth: () => ({
        setStatus: vi.fn(),
        permissions: [],
        hasPermission: () => false,
    }),
}));

describe("Navbar", () => {
    it("renders a top-left previous-page arrow", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(html).toContain('aria-label="Go to previous page"');
    });
});
