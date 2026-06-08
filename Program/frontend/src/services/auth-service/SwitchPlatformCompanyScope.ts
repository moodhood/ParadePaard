import axios from "axios";

export type SwitchPlatformCompanyScopeResponse = {
    companyId?: string;
};

export default async function SwitchPlatformCompanyScope(
    API_BASE_URL: string,
    companyId: string | null
): Promise<SwitchPlatformCompanyScopeResponse> {
    const response = await axios.post<SwitchPlatformCompanyScopeResponse>(
        `${API_BASE_URL}/auth/platform/company-scope`,
        { companyId },
        { withCredentials: true }
    );

    if (response.status !== 200) {
        throw new Error("Failed to switch company scope");
    }

    return response.data;
}
