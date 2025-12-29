import axios from "axios";
import type { LeaveRequestDTO } from "./Types";

export default async function GetListUserLeaveRequests(API_BASE_URL: string, userId: string): Promise<LeaveRequestDTO[]> {
    try {
        const response = await axios.get<LeaveRequestDTO[]>(
            `${API_BASE_URL}/api/users/${userId}/leave-requests`,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        if (response.status !== 200) {
            throw new Error("Failed to fetch leave requests with status: " + response.status);
        }

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Could not load your leave requests");
        }
        throw error;
    }
}
