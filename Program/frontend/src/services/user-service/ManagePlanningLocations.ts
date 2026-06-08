import axios from "axios";
import type { PlanningLocationDTO } from "./GetPlanningLocations";

export type PlanningLocationSaveDTO = {
    name: string;
    streetName?: string | null;
    houseNumber?: string | null;
    houseNumberSuffix?: string | null;
    postalCode?: string | null;
    city?: string | null;
    notes?: string | null;
    clientCompanyId?: string | null;
};

async function unwrap<T>(promise: Promise<{ data: T; status: number }>, fallbackMessage: string): Promise<T> {
    try {
        const response = await promise;
        if (response.status < 200 || response.status >= 300) {
            throw new Error(`${fallbackMessage} with status: ${response.status}`);
        }
        return response.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || fallbackMessage);
        }
        throw err;
    }
}

export async function CreatePlanningLocation(
    apiBaseUrl: string,
    payload: PlanningLocationSaveDTO
): Promise<PlanningLocationDTO> {
    return unwrap(
        axios.post<PlanningLocationDTO>(`${apiBaseUrl}/api/planning/locations`, payload, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }),
        "Failed to create planning location"
    );
}

export async function UpdatePlanningLocation(
    apiBaseUrl: string,
    locationId: string,
    payload: PlanningLocationSaveDTO
): Promise<PlanningLocationDTO> {
    return unwrap(
        axios.put<PlanningLocationDTO>(`${apiBaseUrl}/api/planning/locations/${locationId}`, payload, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }),
        "Failed to update planning location"
    );
}

export async function DeletePlanningLocation(apiBaseUrl: string, locationId: string): Promise<void> {
    await unwrap(
        axios.delete<void>(`${apiBaseUrl}/api/planning/locations/${locationId}`, { withCredentials: true }),
        "Failed to delete planning location"
    );
}
