// src/utils/mapLeaveDtoToUi.ts
import type { LeaveRequest } from "../components/requests/RequestModals";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export type LeaveRequestDTO = {
    requestId: string;
    userId: string;
    userName: string;
    type: "SICK" | "VACATION" | "PERSONAL" | string;
    startDate: string;
    endDate: string;
    hours: number;
    reason?: string;
    status: LeaveStatus;
    createdAt: string;
    updatedAt: string;
};

export type LeaveRequestUI = LeaveRequest & { status: LeaveStatus };

export function mapLeaves(dtos: LeaveRequestDTO[]): LeaveRequestUI[] {
    return dtos.map((d) => ({
        id: d.requestId,
        type: "Leave",
        by: d.userName,
        createdAt: d.createdAt,
        fromDate: d.startDate,
        toDate: d.endDate,
        hoursRequested: d.hours,
        hoursAvailable: d.hours, // placeholder until you wire a real balance
        note: d.reason,
        status: d.status,
    }));
}
