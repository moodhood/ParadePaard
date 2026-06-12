import axios from "axios";

// Triggers the admin-only auth endpoint that issues a fresh password reset
// link and emails it to the user as an "account setup" email. We use this as
// the "redo onboarding" invitation: combined with putting the user back into
// the CHANGES_REQUESTED status it lets the employee re-enter the onboarding
// form and submit updated details for admin review.
export type ResendOnboardingEmailResponse = {
    userId: string;
    email: string;
    emailSent: boolean;
};

export default async function ResendOnboardingEmail(
    apiBaseUrl: string,
    userId: string
): Promise<ResendOnboardingEmailResponse> {
    try {
        const response = await axios.post<ResendOnboardingEmailResponse>(
            `${apiBaseUrl}/auth/admin/users/${userId}/resend-onboarding-email`,
            null,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        if (response.status !== 200) {
            throw new Error("Failed to send onboarding email: " + response.status);
        }

        return response.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const data = err.response?.data as { message?: string } | string | undefined;
            const message =
                (typeof data === "string" && data.trim()) ||
                (typeof data === "object" && data?.message) ||
                "Failed to send onboarding email";
            throw new Error(message);
        }
        throw err;
    }
}
