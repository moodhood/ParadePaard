import axios from "axios";

export type TravelClaimSummaryDTO = {
    kilometers?: number | null;
    ratePerKilometer?: number | null;
    totalAmount?: number | null;
    status?: string | null;
    submittedAt?: string | null;
    reviewedAt?: string | null;
    rejectionNote?: string | null;
    hasProof?: boolean | null;
};

export type EmployeePlanningAssignmentDTO = {
    scheduleEntryId: string;
    userId?: string;
    userDisplayName?: string | null;
    projectId: string;
    projectName: string;
    clientCompanyName?: string | null;
    projectStartDate?: string | null;
    projectEndDate?: string | null;
    internalDescription?: string | null;
    externalDescription?: string | null;
    projectLocation?: string | null;
    shiftId: string;
    shiftName?: string | null;
    shiftDate: string;
    startTime: string;
    endTime: string;
    breakMinutes?: number | null;
    functionName: string;
    shiftLocation?: string | null;
    status: string;
    isPast?: boolean | null;
    timesheetExported?: boolean | null;
    timesheetExportedAt?: string | null;
    travelClaim?: TravelClaimSummaryDTO | null;
};

function unwrapMessage(err: unknown, fallback: string): never {
    if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message || fallback);
    }
    throw err;
}

export async function GetMyPlanning(
    API_BASE_URL: string,
    scope = "all"
): Promise<EmployeePlanningAssignmentDTO[]> {
    try {
        const response = await axios.get<EmployeePlanningAssignmentDTO[]>(`${API_BASE_URL}/api/planning/me`, {
            params: { scope },
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        unwrapMessage(err, "Failed to load your planning");
    }
}

export async function GetMyPlanningAssignment(
    API_BASE_URL: string,
    scheduleEntryId: string
): Promise<EmployeePlanningAssignmentDTO> {
    try {
        const response = await axios.get<EmployeePlanningAssignmentDTO>(`${API_BASE_URL}/api/planning/me/assignments/${scheduleEntryId}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        unwrapMessage(err, "Failed to load this shift");
    }
}

export async function RespondToMyPlanningAssignment(
    API_BASE_URL: string,
    scheduleEntryId: string,
    status: "CONFIRMED" | "CANCELLED"
): Promise<EmployeePlanningAssignmentDTO> {
    try {
        const response = await axios.put<EmployeePlanningAssignmentDTO>(
            `${API_BASE_URL}/api/planning/me/assignments/${scheduleEntryId}/response`,
            { status },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (err) {
        unwrapMessage(err, "Failed to update this shift");
    }
}

export async function SubmitTravelClaim(
    API_BASE_URL: string,
    scheduleEntryId: string,
    payload: { kilometers: number; file?: File | null }
): Promise<EmployeePlanningAssignmentDTO> {
    try {
        const formData = new FormData();
        formData.append("kilometers", String(payload.kilometers));
        if (payload.file) {
            formData.append("file", payload.file);
        }
        const response = await axios.post<EmployeePlanningAssignmentDTO>(
            `${API_BASE_URL}/api/planning/me/assignments/${scheduleEntryId}/travel-claim`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (err) {
        unwrapMessage(err, "Failed to submit travel claim");
    }
}

export async function GetTravelClaimProof(
    API_BASE_URL: string,
    scheduleEntryId: string,
    admin = false
): Promise<Blob> {
    try {
        const path = admin
            ? `${API_BASE_URL}/api/planning/travel-claims/${scheduleEntryId}/proof`
            : `${API_BASE_URL}/api/planning/me/assignments/${scheduleEntryId}/travel-proof`;
        const response = await axios.get(path, {
            responseType: "blob",
            withCredentials: true,
        });
        return response.data as Blob;
    } catch (err) {
        unwrapMessage(err, "Failed to load travel proof");
    }
}

export async function GetPendingTravelClaims(
    API_BASE_URL: string
): Promise<EmployeePlanningAssignmentDTO[]> {
    try {
        const response = await axios.get<EmployeePlanningAssignmentDTO[]>(`${API_BASE_URL}/api/planning/travel-claims/pending`, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        unwrapMessage(err, "Failed to load pending travel claims");
    }
}

export async function ReviewTravelClaim(
    API_BASE_URL: string,
    scheduleEntryId: string,
    payload: { status: "APPROVED" | "REJECTED"; rejectionNote?: string }
): Promise<EmployeePlanningAssignmentDTO> {
    try {
        const response = await axios.put<EmployeePlanningAssignmentDTO>(
            `${API_BASE_URL}/api/planning/travel-claims/${scheduleEntryId}/review`,
            payload,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (err) {
        unwrapMessage(err, "Failed to review travel claim");
    }
}
