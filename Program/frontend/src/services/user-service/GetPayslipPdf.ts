import axios from "axios";

export default async function GetPayslipPdf(API_BASE_URL: string, payslipId: string): Promise<Blob> {
    try {
        const res = await axios.get(`${API_BASE_URL}/api/payroll/${payslipId}`, {
            responseType: "blob",
            params: {
                ts: Date.now(),
            },
            headers: {
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
            },
            withCredentials: true,
        });

        if (res.status !== 200) {
            throw new Error("Failed to fetch payslip PDF with status: " + res.status);
        }

        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.message || "Failed to fetch payslip PDF");
        }
        throw err;
    }
}

