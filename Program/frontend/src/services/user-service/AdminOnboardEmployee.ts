import axios from "axios";
import type { AdminOnboardingRequestDTO, AdminOnboardingResponseDTO } from "./Types";

export default async function AdminOnboardEmployee(
    API_BASE_URL: string,
    payload: AdminOnboardingRequestDTO
): Promise<AdminOnboardingResponseDTO> {
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
}

