import axios from "axios";
import type { UserRolesResponseDTO } from "./types";

export default async function GetUserRoles(
    apiBaseUrl: string,
    userIds: string[]
): Promise<UserRolesResponseDTO[]> {
    if (userIds.length === 0) {
        return [];
    }

    const response = await axios.get<UserRolesResponseDTO[]>(`${apiBaseUrl}/auth/admin/users/roles`, {
        withCredentials: true,
        params: {
            ids: userIds.join(","),
        },
    });

    if (response.status !== 200) {
        throw new Error("Failed to retrieve user roles: " + response.status);
    }

    return response.data ?? [];
}
