import axios from "axios";

export type UserSetupRequest = {
    street: string;
    houseNumber: string;
    houseNumberSuffix?: string | null;
    postalCode: string;
    city: string;
    country: string;
    iban: string;
    bankAccountHolderName?: string | null;
    bsn?: string | null;
    applyLoonheffingskorting?: boolean | null;
    pensionParticipant?: boolean | null;
    specialZvwContribution?: boolean | null;
    payrollNotes?: string | null;
    nationality?: string | null;
    idDocumentType?: string | null;
    idDocumentNumber?: string | null;
    idIssueDate?: string | null;
    idExpirationDate?: string | null;
    idIssuingCountry?: string | null;
    emergencyContactName?: string | null;
    emergencyContactRelationship?: string | null;
    emergencyContactPhone?: string | null;
    emergencyContactEmail?: string | null;
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

export async function UploadIdDocumentImage(API_BASE_URL: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(
        `${API_BASE_URL}/api/user/setup/id-document-image`,
        formData,
        {
            withCredentials: true,
        }
    );

    if (response.status !== 200) {
        throw new Error("ID document upload failed with status: " + response.status);
    }
}
