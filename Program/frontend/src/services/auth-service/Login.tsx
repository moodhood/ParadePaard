import axios from "axios";

export type LoginResponse = {
    message: string;
    userId: string;
    email: string;
};

export default async function Login(email: string, password: string, API_BASE_URL: string): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }
    );

        if (response.status !== 200) {
            throw new Error("Login failed with status: " + response.status);
        }

        return response.data;
}