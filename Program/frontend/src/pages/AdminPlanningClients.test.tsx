import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AdminPlanningClients from "./AdminPlanningClients";

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
        return <a href="/management">Back to Management</a>;
    },
}));

vi.mock("../components/common/Card", () => ({
    default: function MockCard(props: {
        title?: React.ReactNode;
        right?: React.ReactNode;
        children?: React.ReactNode;
    }) {
        return (
            <section>
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

vi.mock("../components/common/PaginationControls", () => ({
    default: function MockPaginationControls() {
        return <div>Pagination</div>;
    },
}));

vi.mock("../services/user-service/UserServices", () => ({
    UserServices: {
        getPlanningClientsPage: vi.fn(),
        createPlanningClient: vi.fn(),
        updatePlanningClient: vi.fn(),
    },
}));

describe("AdminPlanningClients", () => {
    it("renders a shared table frame so headers and client values stay aligned", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <AdminPlanningClients />
            </MemoryRouter>
        );

        expect(html).toContain("planningClientTableFrame");
        expect(html).toContain("planningClientHeaderCell planningClientHeaderCell--identity");
        expect(html).toContain("planningClientAvatarSpacer");
        expect(html).toContain(">Name<");
        expect(html).toContain(">Address<");
        expect(html).toContain(">Company line<");
    });
});
