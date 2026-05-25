import { getIsoWeek } from "./hoursSummary";
import { parseDisplayDate } from "./dateInput";

export type WorkHistoryFilterField =
    | "search"
    | "employee"
    | "function"
    | "project"
    | "shift"
    | "dateFrom"
    | "dateTo"
    | "weekYear"
    | "weekNumber"
    | "minHours"
    | "maxHours"
    | "minTravel"
    | "maxTravel"
    | "financeReadiness";

export type WorkHistoryFilterRow = {
    id: string;
    field: WorkHistoryFilterField;
    value: string;
};

export type WorkHistoryFilterableTimesheet = {
    userId?: string;
    name?: string;
    dateOfIssue?: string;
    weekNumber?: number;
    weekBasedYear?: number;
    function?: string;
    hoursWorked?: number;
    travelExpenses?: number;
    projectName?: string | null;
    shiftName?: string | null;
    clientBillingRatePerHour?: number | null;
    financeReviewNeeded?: boolean | null;
};

export type WorkHistoryFilterOptions<T extends WorkHistoryFilterableTimesheet> = {
    getEmployeeName: (timesheet: T) => string;
    includeEmployeeFilters: boolean;
};

const parseNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : null;
};

const datePart = (value: string | undefined) => (value ?? "").split("T")[0].split(" ")[0];

const matchesText = (value: string | null | undefined, filter: string) => {
    const term = filter.trim().toLowerCase();
    return !term || (value ?? "").toLowerCase().includes(term);
};

const financeStatus = (timesheet: WorkHistoryFilterableTimesheet) => {
    if (timesheet.financeReviewNeeded) return "finance review needed";
    if (timesheet.clientBillingRatePerHour == null) return "billing rate missing";
    return "billing rate set";
};

export function applyWorkHistoryFilters<T extends WorkHistoryFilterableTimesheet>(
    timesheets: readonly T[],
    filters: readonly WorkHistoryFilterRow[],
    options: WorkHistoryFilterOptions<T>
): T[] {
    const activeFilters = filters.filter((filter) => filter.value.trim());
    if (activeFilters.length === 0) return [...timesheets];

    return timesheets.filter((timesheet) => {
        return activeFilters.every((filter) => {
            const value = filter.value.trim();
            const lowerValue = value.toLowerCase();

            switch (filter.field) {
                case "search": {
                    const haystack = [
                        options.getEmployeeName(timesheet),
                        timesheet.function ?? "",
                        timesheet.userId ?? "",
                        timesheet.dateOfIssue ?? "",
                        timesheet.projectName ?? "",
                        timesheet.shiftName ?? "",
                    ]
                        .join(" ")
                        .toLowerCase();
                    return haystack.includes(lowerValue);
                }
                case "employee":
                    if (!options.includeEmployeeFilters) return true;
                    return matchesText(options.getEmployeeName(timesheet), value) || matchesText(timesheet.userId, value);
                case "function":
                    return matchesText(timesheet.function, value);
                case "project":
                    return matchesText(timesheet.projectName, value);
                case "shift":
                    return matchesText(timesheet.shiftName, value) || matchesText(timesheet.function, value);
                case "dateFrom": {
                    const from = parseDisplayDate(value);
                    return !from || datePart(timesheet.dateOfIssue) >= from;
                }
                case "dateTo": {
                    const to = parseDisplayDate(value);
                    return !to || datePart(timesheet.dateOfIssue) <= to;
                }
                case "weekYear":
                case "weekNumber": {
                    const target = parseNumber(value);
                    if (target === null) return true;
                    const date = datePart(timesheet.dateOfIssue);
                    const week =
                        timesheet.weekNumber != null && timesheet.weekBasedYear != null
                            ? { weekNumber: timesheet.weekNumber, weekBasedYear: timesheet.weekBasedYear }
                            : getIsoWeek(new Date(`${date}T00:00:00Z`));
                    return filter.field === "weekYear" ? week.weekBasedYear === target : week.weekNumber === target;
                }
                case "minHours": {
                    const target = parseNumber(value);
                    return target === null || Number(timesheet.hoursWorked ?? 0) >= target;
                }
                case "maxHours": {
                    const target = parseNumber(value);
                    return target === null || Number(timesheet.hoursWorked ?? 0) <= target;
                }
                case "minTravel": {
                    const target = parseNumber(value);
                    return target === null || Number(timesheet.travelExpenses ?? 0) >= target;
                }
                case "maxTravel": {
                    const target = parseNumber(value);
                    return target === null || Number(timesheet.travelExpenses ?? 0) <= target;
                }
                case "financeReadiness":
                    return financeStatus(timesheet).includes(lowerValue);
                default:
                    return true;
            }
        });
    });
}
