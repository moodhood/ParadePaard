import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MyPlanningView } from "./MyPlanning";
import type { EmployeePlanningAssignmentDTO } from "../services/user-service/EmployeePlanning";

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

    it("does not render scheduled shifts section or empty state when there are no scheduled shifts", () => {
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

        expect(html).not.toContain("Scheduled shifts");
        expect(html).not.toContain("No scheduled shifts waiting for a response.");
        expect(html).not.toContain("No past scheduled shifts waiting for a response.");
    });

    it("renders a scheduled response card with accept and decline actions when scheduled shifts exist", () => {
        const scheduledItem: EmployeePlanningAssignmentDTO = {
            scheduleEntryId: "schedule-1",
            eventId: "event-1",
            eventName: "Test Event",
            shiftId: "shift-1",
            shiftDate: "2026-05-20",
            startTime: "2026-05-20T09:00:00Z",
            endTime: "2026-05-20T17:00:00Z",
            functionName: "BAR",
            status: "ASSIGNED",
            isPast: false,
            timesheetExported: false,
        };

        const html = renderToStaticMarkup(
            <MyPlanningView
                activeTab="upcoming"
                scheduledItems={[scheduledItem]}
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

        expect(html).toContain("Test Event");
        expect(html).toContain("Decline");
        expect(html).toContain("Accept");
    });
});
