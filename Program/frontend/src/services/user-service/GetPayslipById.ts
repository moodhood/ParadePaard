import axios from "axios";
import type { PayslipResponseDTO } from "./GetMyPayslips";

export default async function GetPayslipById(
    API_BASE_URL: string,
    payslipId: string
): Promise<PayslipResponseDTO> {
    try {
        const res = await axios.get<PayslipResponseDTO>(
            `${API_BASE_URL}/api/payroll/${payslipId}/json`,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        if (res.status !== 200) {
            throw new Error("Failed to fetch payslip with status: " + res.status);
        }

        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to fetch payslip");
        }
        throw err;
    }
}
