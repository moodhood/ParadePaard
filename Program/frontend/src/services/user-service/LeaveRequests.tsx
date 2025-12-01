// src/services/leave-requests/LeaveRequests.tsx
import type { LeaveRequestCreateDTO, LeaveRequestDTO } from "./types";
import GetLeaveRequests from "./Get-LeaveRequests.tsx";
import GetLeaveRequestsByStatus from "./Get-LeaveRequestsByStatus.tsx";
import CreateLeaveRequest from "./Create-LeaveRequest.tsx";
import ApproveLeaveRequest from "./Approve-LeaveRequest.tsx";
import RejectLeaveRequest from "./Reject-LeaveRequest.tsx";
import GetListUserLeaveRequests from "./Get-ListUserLeaveRequests.tsx";
import GetMe, { type MeResponseDTO } from "./Get-Me.tsx";

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";

const API_BASE_URL =
    (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:4004";

export const LeaveRequests = {
    list: async (status?: LeaveStatus): Promise<LeaveRequestDTO[]> => {
        if (status) return await GetLeaveRequestsByStatus(API_BASE_URL, status);
        return await GetLeaveRequests(API_BASE_URL);
    },

    create: async (
        userId: string,
        payload: LeaveRequestCreateDTO
    ): Promise<LeaveRequestDTO> => {
        return await CreateLeaveRequest(API_BASE_URL, userId, payload);
    },

    approve: async (id: string): Promise<LeaveRequestDTO> => {
        return await ApproveLeaveRequest(API_BASE_URL, id);
    },

    reject: async (id: string, note?: string): Promise<LeaveRequestDTO> => {
        return await RejectLeaveRequest(API_BASE_URL, id, note);
    },

    getMe: async (): Promise<MeResponseDTO> => {
        return await GetMe(API_BASE_URL);
    },

    listMine: async (userId: string): Promise<LeaveRequestDTO[]> => {
        return await GetListUserLeaveRequests(API_BASE_URL, userId);
    },
};
