import axios from "axios";
import type { LeaveRequestDTO } from "./Types";

export default async function ApproveLeaveRequest(
    API_BASE_URL: string,
    requestId: string
): Promise<void> {
    try {
        const res = await axios.put<LeaveRequestDTO>(
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
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to approve");
        }
        throw err;
    }
}
