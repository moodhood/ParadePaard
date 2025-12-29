import axios from "axios";

export default async function ForgotPassword(
    email: string,
    API_BASE_URL: string
): Promise<void> {
    const response = await axios.post(
        `${API_BASE_URL}/auth/forgot-password`,
        { email },
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }
    );

    if (response.status < 200 || response.status >= 300) {
        throw new Error("Forgot password failed with status: " + response.status);
    }
}

