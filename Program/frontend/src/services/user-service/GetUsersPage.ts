import axios from "axios";
import type { UserResponseDTO } from "./Types";
import type { PaginatedResponse, SortedPageRequest } from "./Pagination";

export default async function GetUsersPage(
    API_BASE_URL: string,
    request: SortedPageRequest
): Promise<PaginatedResponse<UserResponseDTO>> {
    const response = await axios.get<PaginatedResponse<UserResponseDTO>>(`${API_BASE_URL}/api/users/paged`, {
        params: {
            page: request.page,
            size: request.size ?? 50,
            sortKey: request.sortKey ?? "name",
            sortDirection: request.sortDirection ?? "asc",
        },
        withCredentials: true,
    });
    return response.data;
}
