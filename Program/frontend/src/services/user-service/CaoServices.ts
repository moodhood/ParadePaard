import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4004";

export type CaoVariableDTO = {
    code: string;
    label: string;
    valueType: "PERCENTAGE" | "AMOUNT" | "HOURS" | "MULTIPLIER" | string;
    value: number | null;
};

export type CaoTemplateDTO = {
    caoId: string;
    companyId: string;
    name: string;
    sector: string | null;
    effectiveFrom: string | null;
    effectiveUntil: string | null;
    variables: CaoVariableDTO[];
};

export type CaoTemplateCreateRequest = {
    name: string;
    sector?: string | null;
    effectiveFrom?: string | null;
    effectiveUntil?: string | null;
    variables: CaoVariableDTO[];
};

export type CaoUserAssignRequest = {
    caoId: string | null;
    overrides?: Record<string, number> | null;
};

const config = () => ({ withCredentials: true });

async function getCaoTemplates(): Promise<CaoTemplateDTO[]> {
    const res = await axios.get<CaoTemplateDTO[]>(`${BASE_URL}/api/cao`, config());
    return res.data;
}

async function getCaoTemplateById(caoId: string): Promise<CaoTemplateDTO> {
    const res = await axios.get<CaoTemplateDTO>(`${BASE_URL}/api/cao/${caoId}`, config());
    return res.data;
}

async function createCaoTemplate(payload: CaoTemplateCreateRequest): Promise<CaoTemplateDTO> {
    const res = await axios.post<CaoTemplateDTO>(`${BASE_URL}/api/cao`, payload, config());
    return res.data;
}

async function updateCaoTemplate(caoId: string, payload: CaoTemplateCreateRequest): Promise<CaoTemplateDTO> {
    const res = await axios.put<CaoTemplateDTO>(`${BASE_URL}/api/cao/${caoId}`, payload, config());
    return res.data;
}

async function deleteCaoTemplate(caoId: string): Promise<void> {
    await axios.delete(`${BASE_URL}/api/cao/${caoId}`, config());
}

function handleAxiosError(err: unknown, fallback: string): never {
    if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message || fallback);
    }
    throw err;
}

export const CaoServices = {
    getCaoTemplates: () => getCaoTemplates().catch((e) => handleAxiosError(e, "Failed to load CAO templates")),
    getCaoTemplateById: (id: string) => getCaoTemplateById(id).catch((e) => handleAxiosError(e, "Failed to load CAO template")),
    createCaoTemplate: (payload: CaoTemplateCreateRequest) => createCaoTemplate(payload).catch((e) => handleAxiosError(e, "Failed to create CAO template")),
    updateCaoTemplate: (id: string, payload: CaoTemplateCreateRequest) => updateCaoTemplate(id, payload).catch((e) => handleAxiosError(e, "Failed to update CAO template")),
    deleteCaoTemplate: (id: string) => deleteCaoTemplate(id).catch((e) => handleAxiosError(e, "Failed to delete CAO template")),
};
