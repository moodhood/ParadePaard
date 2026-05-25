// @ts-expect-error Vitest runs with Node built-ins, but the app tsconfig does not include Node types.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("PrimaryNav layout", () => {
    it("keeps the desktop sidebar fixed while page content scrolls", () => {
        const primaryNavCss = readFileSync(new URL("../stylesheets/PrimaryNav.css", import.meta.url), "utf8");
        const pageShellCss = readFileSync(new URL("../stylesheets/PageShell.css", import.meta.url), "utf8");

        expect(primaryNavCss).toContain("position: fixed;");
        expect(primaryNavCss).toContain("height: calc(100vh - var(--navbar-height) - var(--nav-gap));");
        expect(pageShellCss).toContain(
            "padding-left: calc(var(--sidebar-collapsed-width, 76px) + 24px);"
        );
    });
});
