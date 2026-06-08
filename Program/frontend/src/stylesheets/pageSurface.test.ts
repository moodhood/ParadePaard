import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function stylesheetText(relativePath: string): string {
    return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("shared page surface styling", () => {
    it("uses the same shared background token for the sidebar and admin shell pages", () => {
        const pageShellCss = stylesheetText("./PageShell.css");
        const primaryNavCss = stylesheetText("./PrimaryNav.css");
        const adminDashboardCss = stylesheetText("./AdminDashboard.css");
        const managementCss = stylesheetText("./Management.css");

        expect(pageShellCss).toContain("--app-shell-background");
        expect(primaryNavCss).toContain("var(--app-shell-background");
        expect(adminDashboardCss).toContain("var(--app-shell-background");
        expect(managementCss).toContain("var(--app-shell-background");
    });
});
