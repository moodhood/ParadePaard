import axios from "axios";
import type {
    PlatformCompanyDetailDTO,
    PlatformCompanyOnboardingRequestDTO,
    PlatformCompanyOnboardingResponseDTO,
    PlatformCompanySummaryDTO,
} from "./Types";

export async function GetPlatformCompanies(API_BASE_URL: string): Promise<PlatformCompanySummaryDTO[]> {
    const response = await axios.get<PlatformCompanySummaryDTO[]>(`${API_BASE_URL}/api/admin/platform/companies`, {
        withCredentials: true,
    });
    return response.data;
}

export async function GetPlatformCompany(
    API_BASE_URL: string,
    companyId: string
): Promise<PlatformCompanyDetailDTO> {
    const response = await axios.get<PlatformCompanyDetailDTO>(`${API_BASE_URL}/api/admin/platform/companies/${companyId}`, {
        withCredentials: true,
    });
    return response.data;
}

export async function OnboardPlatformCompany(
    API_BASE_URL: string,
    payload: PlatformCompanyOnboardingRequestDTO
): Promise<PlatformCompanyOnboardingResponseDTO> {
    const response = await axios.post<PlatformCompanyOnboardingResponseDTO>(
        `${API_BASE_URL}/api/admin/platform/companies/onboard`,
        payload,
        {
            withCredentials: true,
        }
    );
    return response.data;
}
