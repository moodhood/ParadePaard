import axios from "axios";

export type IdDocumentSide = "front" | "back";

export default async function GetUserIdDocumentImage(
    API_BASE_URL: string,
    userId: string,
    side: IdDocumentSide = "front"
): Promise<Blob | null> {
    try {
        const path = side === "back" ? "id-document-back-image" : "id-document-image";
        const res = await axios.get(`${API_BASE_URL}/api/users/${userId}/${path}`, {
            responseType: "blob",
            withCredentials: true,
        });

        if (res.status === 204) return null;
        if (res.status !== 200) {
            throw new Error("Failed to fetch ID document image with status: " + res.status);
        }

        return res.data as Blob;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            if (err.response?.status === 404) return null;
            throw new Error(err.response?.data?.message || "Failed to fetch ID document image");
        }
        throw err;
    }
}
