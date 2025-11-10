export type LeaveRequestDTO = {
    requestId: string;
    userId: string;
    userName: string;
    type: "VACATION" | "SICK" | "UNPAID" | "PARENTAL" | "OTHER";
    startDate: string;
    endDate: string;
    hours: number;
    reason: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";
    createdAt: string;
    updatedAt: string;
};

export type LeaveRequestCreateDTO = {
    type: LeaveRequestDTO["type"];
    startDate: string;
    endDate: string;
    hours: number;
    reason?: string;
};
