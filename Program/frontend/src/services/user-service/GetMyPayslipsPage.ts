import axios from "axios";
import type { PayslipResponseDTO } from "./GetMyPayslips";
import type { PageRequest, PaginatedResponse } from "./Pagination";

export default async function GetMyPayslipsPage(
    API_BASE_URL: string,
    request: PageRequest
): Promise<PaginatedResponse<PayslipResponseDTO>> {
    const res = await axios.get<PaginatedResponse<PayslipResponseDTO>>(`${API_BASE_URL}/api/payroll/me/paged`, {
        params: {
            page: request.page,
            size: request.size ?? 50,
        },
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
    });

    if (res.status !== 200) {
        throw new Error("Failed to fetch payslips with status: " + res.status);
    }

    return res.data;
}
