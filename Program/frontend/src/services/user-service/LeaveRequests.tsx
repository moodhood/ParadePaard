import axios from "axios";
import type { LeaveRequestDTO } from "../../utils/mapLeaveDtoToUi";

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

const API_BASE_URL =
    (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:4004";

const client = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

export const LeaveRequests = {
    async list(status?: LeaveStatus): Promise<LeaveRequestDTO[]> {
        const res = await client.get<LeaveRequestDTO[]>("/api/leave-requests", {
            params: status ? { status } : {},
        });
        if (res.status !== 200) {
            throw new Error("Failed to fetch leave requests with status: " + res.status);
        }
        return res.data;
    },

    async approve(id: string, note?: string): Promise<void> {
        const res = await client.put(`/api/leave-requests/${id}/approve`, note ? { note } : undefined);
        if (res.status !== 200) {
            throw new Error("Failed to approve leave request with status: " + res.status);
        }
    },

    async reject(id: string, note?: string): Promise<void> {
        const res = await client.put(`/api/leave-requests/${id}/reject`, note ? { note } : undefined);
        if (res.status !== 200) {
            throw new Error("Failed to reject leave request with status: " + res.status);
        }
    },
};
