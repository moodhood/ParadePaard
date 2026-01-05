import axios from "axios";
import type { PayslipResponseDTO } from "./GetMyPayslips";

export type ReportPayslipErrorRequestDTO = {
    errorDescription: string;
};

export default async function ReportPayslipError(
    API_BASE_URL: string,
    payslipId: string,
    payload: ReportPayslipErrorRequestDTO
): Promise<PayslipResponseDTO> {
    try {
        const res = await axios.post<PayslipResponseDTO>(
            `${API_BASE_URL}/api/payroll/${payslipId}/report-error`,
            payload,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        if (res.status !== 200) {
            throw new Error("Failed to report payslip error with status: " + res.status);
        }

        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to report payslip error");
        }
        throw err;
    }
}
