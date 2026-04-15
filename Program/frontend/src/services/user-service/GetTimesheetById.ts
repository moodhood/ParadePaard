import axios from "axios";
import type { TimesheetRow } from "./GetAllTimesheets";

export default async function GetTimesheetById(
    API_BASE_URL: string,
    timesheetId: string
): Promise<TimesheetRow> {
    try {
        const res = await axios.get<TimesheetRow>(`${API_BASE_URL}/api/timesheet/${timesheetId}`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        });

        if (res.status !== 200) {
            throw new Error("Failed to fetch timesheet with status: " + res.status);
        }

        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to fetch timesheet");
        }
        throw err;
    }
}
