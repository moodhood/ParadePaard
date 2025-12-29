/* src/services/user-service/Get-Users.tsx */
import axios from "axios";
import type { UserResponseDTO } from "./Types";

export default async function GetUsers(API_BASE_URL: string): Promise<UserResponseDTO[]> {
    const response = await axios.get<UserResponseDTO[]>(`${API_BASE_URL}/api/users`, {
        withCredentials: true,
    });
    return response.data;
}
