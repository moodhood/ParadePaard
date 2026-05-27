import axios from "axios";

export type MyTimesheetRow = {
    timesheetId: string;
    dateOfIssue: string;
    function: string;
    hoursWorked: number;
    travelExpenses?: number;
    sourceScheduleEntryId?: string | null;
    sourceShiftId?: string | null;
    sourceProjectId?: string | null;
    projectName?: string | null;
    shiftName?: string | null;
    shiftDate?: string | null;
    shiftStartTime?: string | null;
    shiftEndTime?: string | null;
    breakMinutes?: number | null;
    travelKilometers?: number | null;
    travelRate?: number | null;
};

export default async function GetMyTimesheets(API_BASE_URL: string): Promise<MyTimesheetRow[]> {
    try {
        const res = await axios.get<MyTimesheetRow[]>(`${API_BASE_URL}/api/timesheet/me`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        });

        if (res.status !== 200) {
            throw new Error("Failed to fetch timesheets with status: " + res.status);
        }

        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to fetch timesheets");
        }
        throw err;
    }
}

