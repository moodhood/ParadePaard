import axios from "axios";

export default async function GetUserProfilePicture(
    API_BASE_URL: string,
    userId: string
): Promise<Blob | null> {
    try {
        const res = await axios.get(`${API_BASE_URL}/api/users/${userId}/profile-picture`, {
            responseType: "blob",
            withCredentials: true,
        });

        if (res.status === 204) return null;
        if (res.status !== 200) {
            throw new Error("Failed to fetch profile picture with status: " + res.status);
        }

        return res.data as Blob;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            if (err.response?.status === 404) return null;
            throw new Error(err.response?.data?.message || "Failed to fetch profile picture");
        }
        throw err;
    }
}
