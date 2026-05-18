import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import { SubmitApplication } from "./Applications";
import type { JobApplicationRequestDTO } from "./Types";

vi.mock("axios", () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean }).isAxiosError),
    },
}));

describe("application services", () => {
    it("throws the backend message when application submission fails", async () => {
        vi.mocked(axios.post).mockRejectedValue({
            isAxiosError: true,
            response: {
                status: 409,
                data: { message: "Email Already Exists" },
            },
        });

        try {
            await SubmitApplication("http://localhost:4004", applicationPayload());
            throw new Error("Expected submission to fail");
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toBe("Email Already Exists");
        }
    });
});

function applicationPayload(): JobApplicationRequestDTO {
    return {
        firstNames: "Alex Maria",
        lastName: "Jansen",
        email: "alex@example.com",
        phoneNumber: "+31612345678",
        dateOfBirth: "2000-02-03",
        roleInterest: "Bar team",
        contractPreference: "On-call",
        workedForUsBefore: false,
        contactConsent: true,
        informationAccurate: true,
    };
}
