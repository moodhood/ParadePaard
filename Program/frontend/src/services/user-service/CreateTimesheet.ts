import axios from "axios";

export type CreateTimesheetRequestDTO = {
    userId: string;
    name: string;
    dateOfIssue: string;
    function: string;
    hoursWorked: number;
    travelExpenses?: number | null;
};

export type CreateTimesheetResponseDTO = {
    timesheetId: string;
    userId: string;
    name: string;
    dateOfIssue: string;
    weekNumber?: number;
    weekBasedYear?: number;
    function: string;
    hoursWorked: number;
    travelExpenses?: number | null;
};

export default async function CreateTimesheet(
    API_BASE_URL: string,
    payload: CreateTimesheetRequestDTO
): Promise<CreateTimesheetResponseDTO> {
    try {
        const res = await axios.post<CreateTimesheetResponseDTO>(
            `${API_BASE_URL}/api/timesheet`,
            payload,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        if (res.status !== 200) {
            throw new Error("Failed to create timesheet with status: " + res.status);
        }

        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to create timesheet");
        }
        throw err;
    }
}
