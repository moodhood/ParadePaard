import axios from "axios";

export type RegisterResponse = {
    message: string;
    userId: string;
    email: string;
};

export default async function Register(
    email: string,
    password: string,
    firstName: string | undefined,
    lastName: string | undefined,
    API_BASE_URL: string
): Promise<RegisterResponse> {
    const response = await axios.post<RegisterResponse>(
        `${API_BASE_URL}/auth/register`,
        { email, password, firstName, lastName },
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }
    );

    if (response.status !== 200) {
        throw new Error("Register failed with status: " + response.status);
    }

    return response.data;
}
