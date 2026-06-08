import axios from "axios";
import type { PaginatedResponse } from "./Pagination";
import type { AuditLogEntryDTO, AuditLogQuery } from "./Types";

export async function GetAuditLog(
    API_BASE_URL: string,
    query: AuditLogQuery = {}
): Promise<PaginatedResponse<AuditLogEntryDTO>> {
    const response = await axios.get<PaginatedResponse<AuditLogEntryDTO>>(
        `${API_BASE_URL}/api/admin/audit-log`,
        {
            params: {
                category: query.category ?? undefined,
                action: query.action ?? undefined,
                entityType: query.entityType ?? undefined,
                actorUserId: query.actorUserId ?? undefined,
                occurredFrom: query.occurredFrom ?? undefined,
                occurredTo: query.occurredTo ?? undefined,
                query: query.query ?? undefined,
                page: query.page ?? 0,
                size: query.size ?? 50,
            },
            withCredentials: true,
        }
    );
    return response.data;
}
