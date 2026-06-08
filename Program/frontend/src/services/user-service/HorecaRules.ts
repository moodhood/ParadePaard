import axios from "axios";
import type {
    HorecaJobPresetUpdateDTO,
    HorecaRulePublishRequestDTO,
    HorecaRuleSectionUpdateDTO,
    HorecaRuleVersionDTO,
} from "./Types";

export async function GetCurrentHorecaRules(API_BASE_URL: string): Promise<HorecaRuleVersionDTO> {
    const response = await axios.get<HorecaRuleVersionDTO>(
        `${API_BASE_URL}/api/admin/horeca-rules/current`,
        { withCredentials: true }
    );
    return response.data;
}

export async function UpdateHorecaRuleSection(
    API_BASE_URL: string,
    sectionKey: string,
    payload: HorecaRuleSectionUpdateDTO
): Promise<HorecaRuleVersionDTO> {
    const response = await axios.put<HorecaRuleVersionDTO>(
        `${API_BASE_URL}/api/admin/horeca-rules/sections/${sectionKey}`,
        payload,
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }
    );
    return response.data;
}

export async function UpdateHorecaJobPresets(
    API_BASE_URL: string,
    payload: HorecaJobPresetUpdateDTO
): Promise<HorecaRuleVersionDTO> {
    const response = await axios.put<HorecaRuleVersionDTO>(
        `${API_BASE_URL}/api/admin/horeca-rules/job-presets`,
        payload,
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }
    );
    return response.data;
}

export async function PublishCurrentHorecaRules(
    API_BASE_URL: string,
    payload: HorecaRulePublishRequestDTO
): Promise<HorecaRuleVersionDTO> {
    const response = await axios.post<HorecaRuleVersionDTO>(
        `${API_BASE_URL}/api/admin/horeca-rules/publish`,
        payload,
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }
    );
    return response.data;
}
