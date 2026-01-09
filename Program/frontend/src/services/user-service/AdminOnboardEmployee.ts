import axios from "axios";
import type { AdminOnboardingRequestDTO, AdminOnboardingResponseDTO } from "./Types";

export default async function AdminOnboardEmployee(
    API_BASE_URL: string,
    payload: AdminOnboardingRequestDTO
): Promise<AdminOnboardingResponseDTO> {
    try {
        const response = await axios.post<AdminOnboardingResponseDTO>(
            `${API_BASE_URL}/api/admin/onboarding`,
            payload,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        if (response.status !== 200) {
            throw new Error("Admin onboarding failed with status: " + response.status);
        }

        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const data = error.response?.data as { message?: string } | string | undefined;
            const message =
                (typeof data === "string" && data.trim()) ||
                (typeof data === "object" && data?.message) ||
                (status ? `Admin onboarding failed with status: ${status}` : "Admin onboarding failed");
            throw new Error(message);
        }
        throw error;
    }
}

