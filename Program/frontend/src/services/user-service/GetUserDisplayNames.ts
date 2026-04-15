import axios from "axios";

export default async function GetUserDisplayNames(
    API_BASE_URL: string,
    userIds: string[]
): Promise<Record<string, string>> {
    if (userIds.length === 0) {
        return {};
    }

    try {
        const res = await axios.post<Record<string, string>>(
            `${API_BASE_URL}/api/users/public/display-names`,
            userIds,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        if (res.status !== 200) {
            throw new Error("Failed to fetch user display names with status: " + res.status);
        }

        return res.data ?? {};
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to fetch user display names");
        }
        throw err;
    }
}
