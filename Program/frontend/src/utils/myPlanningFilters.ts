import type { EmployeePlanningAssignmentDTO } from "../services/user-service/UserServices";

function isUpcomingOrCurrent(row: EmployeePlanningAssignmentDTO): boolean {
    return !Boolean(row.isPast);
}

export function getDashboardPendingPlanningRequests(
    rows: EmployeePlanningAssignmentDTO[]
): EmployeePlanningAssignmentDTO[] {
    return rows.filter((row) => row.status === "ASSIGNED" && isUpcomingOrCurrent(row));
}

export function getDashboardAcceptedPlanningRows(
    rows: EmployeePlanningAssignmentDTO[]
): EmployeePlanningAssignmentDTO[] {
    return rows.filter((row) => row.status === "CONFIRMED" && isUpcomingOrCurrent(row));
}
