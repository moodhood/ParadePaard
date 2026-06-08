import axios from "axios";

export type PlanningLocationDTO = {
    locationId: string;
    name: string;
    streetName?: string | null;
    houseNumber?: string | null;
    houseNumberSuffix?: string | null;
    postalCode?: string | null;
    city?: string | null;
    notes?: string | null;
    preferredForClient?: boolean | null;
    lastUsedAtForClient?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
};

export default async function GetPlanningLocations(
    API_BASE_URL: string,
    clientCompanyId?: string | null
): Promise<PlanningLocationDTO[]> {
    try {
        const res = await axios.get<PlanningLocationDTO[]>(`${API_BASE_URL}/api/planning/locations`, {
            params: clientCompanyId ? { clientCompanyId } : undefined,
            withCredentials: true,
        });

        if (res.status !== 200) {
            throw new Error("Failed to fetch planning locations with status: " + res.status);
        }

        return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to fetch planning locations");
        }
        throw err;
    }
}
