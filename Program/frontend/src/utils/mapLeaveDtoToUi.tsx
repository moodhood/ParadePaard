// src/utils/mapLeaveDtoToUi.ts
import type { LeaveRequest } from "../components/requests/RequestModals";
import type { LeaveStatus, LeaveType } from "../services/user-service/UserServices";

export type LeaveRequestDTO = {
    requestId: string;
    userId: string;
    userName: string;
    type: LeaveType
    startDate: string;
    endDate: string;
    hours: number;
    reason?: string | null;
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
        hoursAvailable: d.hours,
        note: d.reason ?? undefined,
        status: d.status,
    }));
}
