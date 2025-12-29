import axios from "axios";

export default async function ResetPassword(
    token: string,
    newPassword: string,
    API_BASE_URL: string
): Promise<void> {
    const response = await axios.post(
        `${API_BASE_URL}/auth/reset-password`,
        { token, newPassword },
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }
    );

    if (response.status < 200 || response.status >= 300) {
        throw new Error("Reset password failed with status: " + response.status);
    }
}

