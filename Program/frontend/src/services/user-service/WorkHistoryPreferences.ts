import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4004";

export type WorkHistoryColumnsPreferenceDTO = {
    columns: string[];
};

export async function getMyWorkHistoryColumnsPreference(): Promise<WorkHistoryColumnsPreferenceDTO> {
    const response = await axios.get<WorkHistoryColumnsPreferenceDTO>(
        `${API_BASE_URL}/api/users/me/preferences/work-history-columns`,
        { withCredentials: true }
    );
    return response.data;
}

export async function updateMyWorkHistoryColumnsPreference(
    columns: string[]
): Promise<WorkHistoryColumnsPreferenceDTO> {
    const response = await axios.put<WorkHistoryColumnsPreferenceDTO>(
        `${API_BASE_URL}/api/users/me/preferences/work-history-columns`,
        { columns },
        { withCredentials: true }
    );
    return response.data;
}
