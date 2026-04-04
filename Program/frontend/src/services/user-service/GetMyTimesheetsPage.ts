import axios from "axios";
import type { PageRequest, PaginatedResponse } from "./Pagination";
import type { MyTimesheetRow } from "./GetMyTimesheets";

export default async function GetMyTimesheetsPage(
    API_BASE_URL: string,
    request: PageRequest
): Promise<PaginatedResponse<MyTimesheetRow>> {
    const res = await axios.get<PaginatedResponse<MyTimesheetRow>>(`${API_BASE_URL}/api/timesheet/me/paged`, {
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
