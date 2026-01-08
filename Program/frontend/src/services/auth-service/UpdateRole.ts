import axios from "axios";
import type { RoleResponseDTO, UpdateRoleRequestDTO } from "./types";

export default async function UpdateRole(
    apiBaseUrl: string,
    roleId: string,
    payload: UpdateRoleRequestDTO
): Promise<RoleResponseDTO> {
    const res = await axios.put<RoleResponseDTO>(
        `${apiBaseUrl}/auth/admin/roles/${roleId}`,
        payload,
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }
    );

    if (res.status !== 200) {
        throw new Error("Failed to update role: " + res.status);
    }

    return res.data;
}
