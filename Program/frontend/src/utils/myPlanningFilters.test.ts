import { describe, expect, it } from "vitest";
import type { EmployeePlanningAssignmentDTO } from "../services/user-service/UserServices";
import {
    getDashboardAcceptedPlanningRows,
    getDashboardPendingPlanningRequests,
} from "./myPlanningFilters";

function assignment(
    scheduleEntryId: string,
    status: string,
    isPast: boolean
): EmployeePlanningAssignmentDTO {
    return {
        scheduleEntryId,
        eventId: `event-${scheduleEntryId}`,
        eventName: `Event ${scheduleEntryId}`,
        shiftId: `shift-${scheduleEntryId}`,
        shiftDate: isPast ? "2026-05-01" : "2026-05-20",
        startTime: isPast ? "2026-05-01T09:00:00" : "2026-05-20T09:00:00",
        endTime: isPast ? "2026-05-01T17:00:00" : "2026-05-20T17:00:00",
        functionName: "Host",
        status,
        isPast,
    };
}

describe("myPlanningFilters", () => {
    it("keeps ended shift requests off the dashboard pending list", () => {
        const rows = [
            assignment("future-request", "ASSIGNED", false),
            assignment("past-request", "ASSIGNED", true),
            assignment("future-accepted", "CONFIRMED", false),
        ];

        expect(getDashboardPendingPlanningRequests(rows).map((row) => row.scheduleEntryId)).toEqual([
            "future-request",
        ]);
    });

    it("keeps ended accepted shifts off the dashboard accepted list", () => {
        const rows = [
            assignment("future-accepted", "CONFIRMED", false),
            assignment("past-accepted", "CONFIRMED", true),
            assignment("future-request", "ASSIGNED", false),
        ];

        expect(getDashboardAcceptedPlanningRows(rows).map((row) => row.scheduleEntryId)).toEqual([
            "future-accepted",
        ]);
    });
});
