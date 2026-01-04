import axios from "axios";
import type { UserResponseDTO } from "./Types";

export type UpdatePayslipFrequencyRequestDTO = {
    payslipFrequencyMinutes: number;
};

export default async function UpdateMyPayslipFrequency(
    API_BASE_URL: string,
    payload: UpdatePayslipFrequencyRequestDTO
): Promise<UserResponseDTO> {
    try {
        const res = await axios.put<UserResponseDTO>(
            `${API_BASE_URL}/api/users/me/payslip-frequency`,
            payload,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );
        if (res.status !== 200) {
            throw new Error("Failed to update payslip frequency with status: " + res.status);
        }
        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to update payslip frequency");
        }
        throw err;
    }
}

