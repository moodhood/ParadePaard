import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ForgotPassword from "./ForgotPassword";

describe("ForgotPassword", () => {
    it("uses generic Back wording for the login return action", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );

        expect(html).toContain(">Back</a>");
        expect(html).not.toContain("Back to login");
    });
});
