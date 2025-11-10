import axios from "axios";
import type { LeaveRequestCreateDTO, LeaveRequestDTO } from "./types";

export default async function CreateLeaveRequest(
    API_BASE_URL: string,
    userId: string,
    payload: LeaveRequestCreateDTO
): Promise<LeaveRequestDTO> {
    try {
        const res = await axios.post<LeaveRequestDTO>(
            `${API_BASE_URL}/api/users/${userId}/leave-requests`,
            payload,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );
        if (res.status !== 200) {
            throw new Error("Failed to create with status: " + res.status);
        }
        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to create");
        }
        throw err;
    }
}
