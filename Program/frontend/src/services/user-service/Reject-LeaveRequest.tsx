import axios from "axios";
import type { LeaveRequestDTO } from "./types";

export default async function RejectLeaveRequest(
    API_BASE_URL: string,
    requestId: string,
    note?: string
): Promise<void> {
    try {
        const res = await axios.put<LeaveRequestDTO>(
            `${API_BASE_URL}/api/leave-requests/${requestId}/reject`,
            note ? { reason: note } : {},
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );
        if (res.status !== 200) {
            throw new Error("Failed to reject with status: " + res.status);
        }
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to reject");
        }
        throw err;
    }
}
