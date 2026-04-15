import axios from "axios";
import type { EmployeePlanningAssignmentDTO } from "./EmployeePlanning";

export default async function GetPlanningAssignmentAdmin(
    API_BASE_URL: string,
    scheduleEntryId: string
): Promise<EmployeePlanningAssignmentDTO> {
    try {
        const response = await axios.get<EmployeePlanningAssignmentDTO>(
            `${API_BASE_URL}/api/planning/assignments/${scheduleEntryId}`,
            {
                withCredentials: true,
            }
        );
        return response.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to load this worked shift");
        }
        throw err;
    }
}
