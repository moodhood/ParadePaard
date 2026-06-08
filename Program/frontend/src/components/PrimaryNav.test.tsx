// @ts-expect-error Vitest runs with Node built-ins, but the app tsconfig does not include Node types.
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PrimaryNav from "./PrimaryNav";

let permissions: string[] = [];

vi.mock("../context/AuthContext", () => ({
    useAuth: () => ({
        permissions,
    }),
}));

describe("PrimaryNav layout", () => {
    it("keeps the desktop sidebar fixed while page content scrolls without adding a top gap below the navbar", () => {
        const primaryNavCss = readFileSync(new URL("../stylesheets/PrimaryNav.css", import.meta.url), "utf8");
        const pageShellCss = readFileSync(new URL("../stylesheets/PageShell.css", import.meta.url), "utf8");

        expect(primaryNavCss).toContain("position: fixed;");
        expect(primaryNavCss).toContain("top: var(--navbar-height);");
        expect(primaryNavCss).toContain("height: calc(100vh - var(--navbar-height));");
        expect(pageShellCss).toContain(
            "padding-left: calc(var(--sidebar-collapsed-width, 76px) + 24px);"
        );
        expect(pageShellCss).toContain("padding-top: var(--nav-gap);");
    });
});

describe("PrimaryNav message badge", () => {
    it("shows the unread message count on the Messages link", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <PrimaryNav messageUnreadCount={2} />
            </MemoryRouter>
        );

        expect(html).toContain('aria-label="Messages, 2 unread"');
        expect(html).toContain('class="primaryNavBadge"');
        expect(html).toContain(">2</span>");
    });

    it("hides the unread message badge when there are no unread messages", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <PrimaryNav messageUnreadCount={0} />
            </MemoryRouter>
        );

        expect(html).toContain('aria-label="Messages"');
        expect(html).not.toContain('class="primaryNavBadge"');
    });

    it("shows a Platform link for platform admins", () => {
        permissions = ["CAN_MANAGE_PLATFORM"];

        const html = renderToStaticMarkup(
            <MemoryRouter>
                <PrimaryNav messageUnreadCount={0} />
            </MemoryRouter>
        );

        expect(html).toContain('aria-label="Platform"');
        expect(html).toContain(">Platform</span>");
    });
});
