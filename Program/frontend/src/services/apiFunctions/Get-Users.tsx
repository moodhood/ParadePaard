import axios from "axios";

export type UserResponseDTO = {
    userId: string;
    name: string;
    email: string;
    streetName: string;
    houseNumber: string;
    houseNumberSuffix: string;
    postalCode: string;
    city: string;
    country: string;
    dateOfBirth: string;
    registeredDate: string;
    bankAccountNumber: string;
    phoneNumber: string;
};

export default async function GetUsers(API_BASE_URL: string): Promise<UserResponseDTO[]> {
    try {
        const response = await axios.get<UserResponseDTO[]>(
            `${API_BASE_URL}/api/users`,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        if (response.status !== 200) {
            throw new Error("Failed to fetch users with status: " + response.status);
        }

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch users");
        }
        throw error;
    }
}