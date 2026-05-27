import { describe, expect, it } from "vitest";
import AdminPlanningProjectDetail from "./AdminPlanningProjectDetail";

describe("AdminPlanningProjectDetail", () => {
    it("exports the planning project detail page component", () => {
        expect(typeof AdminPlanningProjectDetail).toBe("function");
    });
});
