import axios from "axios";
import type { UserResponseDTO } from "./Types";

export default async function GetUserById(
    API_BASE_URL: string,
    userId: string
): Promise<UserResponseDTO> {
    try {
        const res = await axios.get<UserResponseDTO>(`${API_BASE_URL}/api/users/${userId}`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        });

        if (res.status !== 200) {
            throw new Error("Failed to fetch user with status: " + res.status);
        }

        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to fetch user");
        }
        throw err;
    }
}
