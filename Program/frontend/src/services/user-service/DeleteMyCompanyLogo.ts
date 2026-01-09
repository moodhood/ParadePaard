import axios from "axios";

export default async function DeleteMyCompanyLogo(API_BASE_URL: string): Promise<void> {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/users/me/company-logo`, {
            withCredentials: true,
        });

        if (response.status !== 204) {
            throw new Error("Failed to delete company logo with status: " + response.status);
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Could not remove company logo");
        }
        throw error;
    }
}
