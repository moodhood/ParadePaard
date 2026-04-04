import axios from "axios";
import type { PageRequest, PaginatedResponse } from "./Pagination";
import type { PlanningClientCompanyDTO } from "./GetPlanningClients";

export default async function GetPlanningClientsPage(
    API_BASE_URL: string,
    request: PageRequest
): Promise<PaginatedResponse<PlanningClientCompanyDTO>> {
    const res = await axios.get<PaginatedResponse<PlanningClientCompanyDTO>>(`${API_BASE_URL}/api/planning/clients/paged`, {
        params: {
            page: request.page,
            size: request.size ?? 50,
        },
        withCredentials: true,
    });

    if (res.status !== 200) {
        throw new Error("Failed to fetch client companies with status: " + res.status);
    }

    return res.data;
}
