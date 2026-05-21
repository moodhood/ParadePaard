import axios from "axios";
import type { UserResponseDTO } from "./Types";

export default async function SearchUsers(
    API_BASE_URL: string,
    query: string,
    limit = 20
): Promise<UserResponseDTO[]> {
    const response = await axios.get<UserResponseDTO[]>(`${API_BASE_URL}/api/users/search`, {
        params: {
            q: query,
            limit,
        },
        withCredentials: true,
    });

    return response.data;
}

