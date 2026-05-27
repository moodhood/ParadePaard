import axios from "axios";

export type TimesheetRow = {
    timesheetId: string;
    userId: string;
    name: string;
    dateOfIssue: string;
    weekNumber?: number;
    weekBasedYear?: number;
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

export default async function GetAllTimesheets(API_BASE_URL: string): Promise<TimesheetRow[]> {
    try {
        const res = await axios.get<TimesheetRow[]>(`${API_BASE_URL}/api/timesheet`, {
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

