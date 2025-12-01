// src/services/leave-requests/types.ts
export type LeaveType = "VACATION" | "SICK" | "UNPAID" | "PARENTAL" | "OTHER";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";

export type LeaveRequestCreateDTO = {
    type: LeaveType;
    startDate: string;
    endDate: string;
    hours: number;
    reason?: string;
};

export type LeaveRequestDTO = {
    requestId: string;
    userId: string;
    userName: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    hours: number;
    reason: string | null;
    status: LeaveStatus;
    createdAt: string;
    updatedAt: string;
};
