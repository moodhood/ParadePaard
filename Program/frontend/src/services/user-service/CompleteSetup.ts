import axios from "axios";

export type UserSetupRequest = {
    street: string;
    houseNumber: string;
    houseNumberSuffix?: string | null;
    postalCode: string;
    city: string;
    country: string;
    iban: string;
};

export default async function CompleteSetup(API_BASE_URL: string, payload: UserSetupRequest): Promise<void> {
    const response = await axios.post(
        `${API_BASE_URL}/api/user/setup`,
        payload,
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        }
    );

    if (response.status !== 200) {
        throw new Error("Setup failed with status: " + response.status);
    }
}
