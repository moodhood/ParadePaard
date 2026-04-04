import axios from "axios";
import type { PageRequest, PaginatedResponse } from "./Pagination";
import type { TimesheetRow } from "./GetAllTimesheets";

export default async function GetAllTimesheetsPage(
    API_BASE_URL: string,
    request: PageRequest
): Promise<PaginatedResponse<TimesheetRow>> {
    const res = await axios.get<PaginatedResponse<TimesheetRow>>(`${API_BASE_URL}/api/timesheet/paged`, {
        params: {
            page: request.page,
            size: request.size ?? 50,
        },
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
    });

    if (res.status !== 200) {
        throw new Error("Failed to fetch timesheets with status: " + res.status);
    }

    return res.data;
}
