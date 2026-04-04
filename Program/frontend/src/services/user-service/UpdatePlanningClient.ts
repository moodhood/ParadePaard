import axios from "axios";
import type { PlanningClientCompanyDTO } from "./GetPlanningClients";
import type { PlanningClientCompanySaveDTO } from "./CreatePlanningClient";

export default async function UpdatePlanningClient(
    API_BASE_URL: string,
    clientCompanyId: string,
    payload: PlanningClientCompanySaveDTO
): Promise<PlanningClientCompanyDTO> {
    try {
        const res = await axios.put<PlanningClientCompanyDTO>(
            `${API_BASE_URL}/api/planning/clients/${clientCompanyId}`,
            payload,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        if (res.status < 200 || res.status >= 300) {
            throw new Error("Failed to update client company with status: " + res.status);
        }

        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to update client company");
        }
        throw err;
    }
}
