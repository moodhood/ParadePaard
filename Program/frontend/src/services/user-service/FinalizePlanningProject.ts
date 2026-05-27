import FinalizePlanningEvent, {
    type FinalizePlanningRequestDTO as LegacyFinalizePlanningRequestDTO,
    type FinalizePlanningResponseDTO,
} from "./FinalizePlanningEvent";

export type FinalizePlanningRequestDTO = Omit<LegacyFinalizePlanningRequestDTO, "eventId"> & {
    eventId?: string;
    projectId?: string;
};

export type { FinalizePlanningResponseDTO };

export default async function FinalizePlanningProject(
    apiBaseUrl: string,
    payload: FinalizePlanningRequestDTO
): Promise<FinalizePlanningResponseDTO> {
    const { projectId, ...legacyPayload } = payload;

    return FinalizePlanningEvent(apiBaseUrl, {
        ...legacyPayload,
        eventId: payload.eventId ?? payload.projectId,
    });
}
