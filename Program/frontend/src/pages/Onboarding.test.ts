import { describe, expect, it } from "vitest";
// @ts-expect-error The app tsconfig does not include Node types, but Vitest runs this test in Node.
import { readFileSync } from "node:fs";

describe("Onboarding address layout", () => {
    it("keeps house number and suffix inputs inside separate grid cells", () => {
        const onboardingCss = readFileSync(new URL("../stylesheets/Onboarding.css", import.meta.url), "utf8");

        expect(onboardingCss).toMatch(/\.step-panel input\s*\{[^}]*box-sizing:\s*border-box;/s);
    });
});
