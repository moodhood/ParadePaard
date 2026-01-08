import axios from "axios";

export default async function DeleteRole(apiBaseUrl: string, roleId: string): Promise<void> {
    const res = await axios.delete(`${apiBaseUrl}/auth/admin/roles/${roleId}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
    });

    if (res.status !== 204) {
        throw new Error("Failed to delete role: " + res.status);
    }
}
