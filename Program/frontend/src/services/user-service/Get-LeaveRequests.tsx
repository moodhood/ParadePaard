import axios from "axios";
import type { LeaveRequestDTO } from "./types.tsx";

export default async function GetLeaveRequests(
    API_BASE_URL: string
): Promise<LeaveRequestDTO[]> {
    try {
        const res = await axios.get<LeaveRequestDTO[]>(
            `${API_BASE_URL}/api/leave-requests`,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );
        if (res.status !== 200) {
            throw new Error(
                "Failed to fetch leave requests with status: " + res.status
            );
        }
        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(
                err.response?.data?.message || "Failed to fetch leave requests"
            );
        }
        throw err;
    }
}
