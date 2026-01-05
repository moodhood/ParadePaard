import axios from "axios";

export type ContractResponseDTO = {
    contractId: string;
    userId: string;
    startDate?: string | null;
    endDate?: string | null;
    contractType?: string | null;
    status?: string | null;
    grossHourlyWage?: number | null;
    travelAllowance?: boolean | null;
};

export default async function GetContracts(API_BASE_URL: string): Promise<ContractResponseDTO[]> {
    try {
        const res = await axios.get<ContractResponseDTO[]>(`${API_BASE_URL}/api/contract`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        });

        if (res.status !== 200) {
            throw new Error("Failed to fetch contracts with status: " + res.status);
        }

        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to fetch contracts");
        }
        throw err;
    }
}
