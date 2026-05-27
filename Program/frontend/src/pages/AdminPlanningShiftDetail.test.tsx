import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AdminPlanningShiftDetail from "./AdminPlanningShiftDetail";

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return {
        ...actual,
        Navigate: function MockNavigate(props: { to: string }) {
            return <div data-to={props.to} />;
        },
        useParams: () => ({
            eventId: "project-42",
            shiftId: "shift-7",
        }),
    };
});

describe("AdminPlanningShiftDetail", () => {
    it("redirects shift detail requests to the project-based planning detail route", () => {
        const html = renderToStaticMarkup(<AdminPlanningShiftDetail />);

        expect(html).toContain('/management/planning/projects/project-42?shift=shift-7');
    });
});
