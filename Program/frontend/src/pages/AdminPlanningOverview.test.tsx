import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AdminPlanningOverview from "./AdminPlanningOverview";

vi.mock("../components/Navbar", () => ({
    default: function MockNavbar() {
        return <nav aria-label="Navbar" />;
    },
}));

vi.mock("../components/PrimaryNav", () => ({
    default: function MockPrimaryNav() {
        return <nav aria-label="Primary navigation" />;
    },
}));

vi.mock("../components/PageBack", () => ({
    default: function MockPageBack() {
        return <button type="button">Back</button>;
    },
}));

vi.mock("../components/common/Card", () => ({
    default: function MockCard(props: {
        title?: React.ReactNode;
        right?: React.ReactNode;
        children?: React.ReactNode;
        className?: string;
    }) {
        return (
            <section className={props.className}>
                <div>{props.title}</div>
                <div>{props.right}</div>
                <div>{props.children}</div>
            </section>
        );
    },
}));

vi.mock("../components/common/Modal", () => ({
    default: function MockModal() {
        return null;
    },
}));

vi.mock("../components/planning/ShiftActionMenu", () => ({
    default: function MockShiftActionMenu() {
        return null;
    },
}));

vi.mock("../services/user-service/UserServices", () => ({
    UserServices: {
        getPlanningOverview: vi.fn(),
        getPlanningClients: vi.fn(),
        getUsersPage: vi.fn(),
        createPlanningProject: vi.fn(),
        createPlanningAssignment: vi.fn(),
        updatePlanningAssignment: vi.fn(),
    },
}));

describe("AdminPlanningOverview", () => {
    it("shows shift and project tabs while defaulting to shifts and keeping the layout selector", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <AdminPlanningOverview />
            </MemoryRouter>
        );

        expect(html).toContain(">Shifts<");
        expect(html).toContain(">Projects<");
        expect(html).toContain("planningModeToggleButton--active");
        expect(html).toContain("Weekly or monthly view for projects and shifts.");
        expect(html).toContain("Calendar view");
        expect(html).toContain("List view");
    });
});
