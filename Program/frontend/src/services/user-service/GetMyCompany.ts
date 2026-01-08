import axios from "axios";
import type { CompanyResponseDTO } from "./Types";

export default async function GetMyCompany(API_BASE_URL: string): Promise<CompanyResponseDTO> {
    try {
        const response = await axios.get<CompanyResponseDTO>(
            `${API_BASE_URL}/api/users/me/company`,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        if (response.status !== 200) {
            throw new Error("Failed to fetch company with status: " + response.status);
        }

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Could not load company");
        }
        throw error;
    }
}
