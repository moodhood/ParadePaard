// src/services/leave-requests/types.ts
export type LeaveType = "VACATION" | "SICK" | "UNPAID" | "PARENTAL" | "OTHER";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";

export type UserResponseDTO = {
    userId: string;
    name: string;
    email: string;
    initials: string | null;
    nickname: string | null;
    firstNames: string | null;
    infix: string | null;
    lastName: string | null;
    gender: string | null;
    streetName: string | null;
    houseNumber: string | null;
    houseNumberSuffix: string | null;
    postalCode: string | null;
    city: string | null;
    country: string | null;
    iban: string | null;
    accountHolderName: string | null;
    bankCountry: string | null;
    nationality: string | null;
    idType: string | null;
    idNumber: string | null;
    idIssueDate: string | null;
    idExpirationDate: string | null;
    physicallyDemanding: boolean | null;
    applyPayrollTax: boolean | null;
    previousContractInLastSixMonths: boolean | null;
    dateOfBirth: string | null;
    registeredDate: string;
    bankAccountNumber: string | null;
    phoneNumber: string | null;
    mobileNumber: string | null;
    leaveHours: string | null;
    status?: "PENDING_SETUP" | "ACTIVE";
};

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
