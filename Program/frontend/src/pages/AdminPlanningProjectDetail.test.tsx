import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AdminPlanningProjectDetail from "./AdminPlanningProjectDetail";

vi.mock("./AdminPlanningEventDetail", () => ({
    default: function MockAdminPlanningEventDetail() {
        return <div>Legacy planning event detail</div>;
    },
}));

describe("AdminPlanningProjectDetail", () => {
    it("reuses the existing planning detail page while project naming is rolled out", () => {
        const html = renderToStaticMarkup(<AdminPlanningProjectDetail />);

        expect(html).toContain("Legacy planning event detail");
    });
});
