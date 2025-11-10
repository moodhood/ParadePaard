import axios from "axios";
import type { LeaveRequestDTO } from "./types";

export default async function ApproveLeaveRequest(
    API_BASE_URL: string,
    requestId: string
): Promise<LeaveRequestDTO> {
    try {
        const res = await axios.post<LeaveRequestDTO>(
            `${API_BASE_URL}/api/leave-requests/${requestId}/approve`,
            {},
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );
        if (res.status !== 200) {
            throw new Error("Failed to approve with status: " + res.status);
        }
        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to approve");
        }
        throw err;
    }
}
