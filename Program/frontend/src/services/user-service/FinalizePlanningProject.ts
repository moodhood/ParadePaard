import axios from "axios";

export type FinalizePlanningRequestDTO = {
    companyId: string;
    projectId?: string;
    eventId?: string;
    isoWeek?: number;
    weekBasedYear?: number;
};

export type FinalizePlanningResponseDTO = {
    createdTimesheets: number;
    finalizedProjectIds: string[];
    warnings: string[];
};

export default async function FinalizePlanningProject(
    apiBaseUrl: string,
    payload: FinalizePlanningRequestDTO
): Promise<FinalizePlanningResponseDTO> {
    try {
        const res = await axios.post<FinalizePlanningResponseDTO>(
            `${apiBaseUrl}/api/planning/finalization`,
            {
                companyId: payload.companyId,
                projectId: payload.projectId ?? payload.eventId,
                isoWeek: payload.isoWeek,
                weekBasedYear: payload.weekBasedYear,
            },
            { withCredentials: true }
        );

        if (res.status !== 200) {
            throw new Error("Failed to finalize planning with status: " + res.status);
        }

        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to finalize planning");
        }
        throw err;
    }
}
