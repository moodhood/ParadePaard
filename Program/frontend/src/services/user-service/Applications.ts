import axios from "axios";
import type {
    ApplicationDecisionRequestDTO,
    JobApplicationRequestDTO,
    JobApplicationResponseDTO,
} from "./Types";

export async function SubmitApplication(
    API_BASE_URL: string,
    payload: JobApplicationRequestDTO,
    cv?: File | null
): Promise<JobApplicationResponseDTO> {
    const formData = new FormData();
    formData.append(
        "application",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
    );

    if (cv) {
        formData.append("cv", cv);
    }

    const response = await axios.post<JobApplicationResponseDTO>(
        `${API_BASE_URL}/api/applications`,
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
        }
    );

    return response.data;
}

export async function GetApplications(
    API_BASE_URL: string
): Promise<JobApplicationResponseDTO[]> {
    const response = await axios.get<JobApplicationResponseDTO[]>(
        `${API_BASE_URL}/api/admin/applications`,
        { withCredentials: true }
    );

    return response.data;
}

export async function GetApplication(
    API_BASE_URL: string,
    applicationId: string
): Promise<JobApplicationResponseDTO> {
    const response = await axios.get<JobApplicationResponseDTO>(
        `${API_BASE_URL}/api/admin/applications/${applicationId}`,
        { withCredentials: true }
    );

    return response.data;
}

export async function AcceptApplication(
    API_BASE_URL: string,
    applicationId: string,
    payload: ApplicationDecisionRequestDTO
): Promise<JobApplicationResponseDTO> {
    const response = await axios.post<JobApplicationResponseDTO>(
        `${API_BASE_URL}/api/admin/applications/${applicationId}/accept`,
        payload,
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }
    );

    return response.data;
}

export async function DenyApplication(
    API_BASE_URL: string,
    applicationId: string,
    payload: ApplicationDecisionRequestDTO
): Promise<JobApplicationResponseDTO> {
    const response = await axios.post<JobApplicationResponseDTO>(
        `${API_BASE_URL}/api/admin/applications/${applicationId}/deny`,
        payload,
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }
    );

    return response.data;
}

export async function GetApplicationCv(
    API_BASE_URL: string,
    applicationId: string
): Promise<Blob> {
    const response = await axios.get(
        `${API_BASE_URL}/api/admin/applications/${applicationId}/cv`,
        {
            responseType: "blob",
            withCredentials: true,
        }
    );

    return response.data as Blob;
}
