import axios from "axios";

export default async function isAdmin(apiBaseUrl: string): Promise<boolean> {
    const response = await axios.get<boolean>(`${apiBaseUrl}/auth/is-admin`, {
        withCredentials: true,
    });

    if (response.status !== 200) {
        throw new Error("Failed to retrieve role: " + response.status);
    }

    return response.data;
}
