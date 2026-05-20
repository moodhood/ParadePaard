import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MyPlanningView } from "./MyPlanning";

vi.mock("../components/Navbar", () => ({
    default: function MockNavbar() {
        return <header aria-label="Navbar" />;
    },
}));

vi.mock("../components/PrimaryNav", () => ({
    default: function MockPrimaryNav() {
        return <nav aria-label="Primary navigation" />;
    },
}));

describe("MyPlanning", () => {
    it("renders accepted shifts header", () => {
        const html = renderToStaticMarkup(
            <MyPlanningView
                activeTab="upcoming"
                scheduledItems={[]}
                acceptedItems={[]}
                loading={false}
                error={null}
                pendingActionId={null}
                onTabChange={() => undefined}
                onDecline={() => undefined}
                onAccept={() => undefined}
                onOpenShift={() => undefined}
            />
        );

        expect(html).toContain("Accepted shifts");
    });
});

