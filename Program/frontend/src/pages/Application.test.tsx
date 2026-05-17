import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import Application, { submitApplicationForm, toApplicationPayload } from "./Application";
import { UserServices } from "../services/user-service/UserServices";

describe("Application", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders the public application form fields", () => {
        const html = renderToStaticMarkup(<Application />);

        expect(html).toContain("Full first names");
        expect(html).toContain("Preferred name");
        expect(html).toContain("Prefix");
        expect(html).toContain("Surname");
        expect(html).toContain("Email address");
        expect(html).toContain("Phone number");
        expect(html).toContain("Date of birth");
        expect(html).toContain("Role interest");
        expect(html).toContain("Contract preference");
        expect(html).toContain("Availability notes");
        expect(html).toContain("Relevant experience");
        expect(html).toContain("Languages");
        expect(html).toContain("Certificates");
        expect(html).toContain("Worked for ParadePaard before");
        expect(html).toContain("Submit application");
    });

    it("builds the application payload with all supported non-sensitive fields", () => {
        expect(toApplicationPayload({
            firstNames: " Alex Maria ",
            preferredName: " Alex ",
            middleNamePrefix: " van ",
            lastName: " Jansen ",
            email: " alex@example.com ",
            phoneNumber: " +31612345678 ",
            dateOfBirth: "2000-02-03",
            gender: "Female",
            nationality: "Dutch",
            city: "Amsterdam",
            country: "Netherlands",
            roleInterest: " Bar team ",
            contractPreference: "On-call",
            availableFrom: "2026-06-01",
            availabilityNotes: "Weekends and evenings",
            motivation: "I like events",
            experience: "Two festival seasons",
            languages: "Dutch, English",
            certificates: "BHV",
            workedForUsBefore: true,
            contactConsent: true,
            informationAccurate: true,
        })).toEqual({
            firstNames: "Alex Maria",
            preferredName: "Alex",
            middleNamePrefix: "van",
            lastName: "Jansen",
            email: "alex@example.com",
            phoneNumber: "+31612345678",
            dateOfBirth: "2000-02-03",
            gender: "Female",
            nationality: "Dutch",
            city: "Amsterdam",
            country: "Netherlands",
            roleInterest: "Bar team",
            contractPreference: "On-call",
            availableFrom: "2026-06-01",
            availabilityNotes: "Weekends and evenings",
            motivation: "I like events",
            experience: "Two festival seasons",
            languages: "Dutch, English",
            certificates: "BHV",
            workedForUsBefore: true,
            contactConsent: true,
            informationAccurate: true,
        });
    });

    it("submits a minimal valid application and can show the success state", async () => {
        const submitApplication = vi
            .spyOn(UserServices, "submitApplication")
            .mockResolvedValue({
                applicationId: "application-1",
                firstNames: "Alex Maria",
                lastName: "Jansen",
                email: "alex@example.com",
                phoneNumber: "+31612345678",
                dateOfBirth: "2000-02-03",
                roleInterest: "Bar team",
                contractPreference: "On-call",
                preferredName: "Alex",
                middleNamePrefix: "van",
                availabilityNotes: "Weekends",
                experience: "Events",
                languages: "Dutch, English",
                certificates: "BHV",
                workedForUsBefore: true,
                contactConsent: true,
                informationAccurate: true,
                status: "APPLICATION_SUBMITTED",
            });

        await submitApplicationForm({
            firstNames: "Alex Maria",
            lastName: "Jansen",
            email: "alex@example.com",
            phoneNumber: "+31612345678",
            dateOfBirth: "2000-02-03",
            roleInterest: "Bar team",
            contractPreference: "On-call",
            preferredName: "Alex",
            middleNamePrefix: "van",
            availabilityNotes: "Weekends",
            experience: "Events",
            languages: "Dutch, English",
            certificates: "BHV",
            workedForUsBefore: true,
            contactConsent: true,
            informationAccurate: true,
        });

        expect(submitApplication).toHaveBeenCalledWith(
            expect.objectContaining({
                firstNames: "Alex Maria",
                lastName: "Jansen",
                email: "alex@example.com",
                phoneNumber: "+31612345678",
                dateOfBirth: "2000-02-03",
                roleInterest: "Bar team",
                contractPreference: "On-call",
                preferredName: "Alex",
                middleNamePrefix: "van",
                availabilityNotes: "Weekends",
                experience: "Events",
                languages: "Dutch, English",
                certificates: "BHV",
                workedForUsBefore: true,
                contactConsent: true,
                informationAccurate: true,
            }),
            null
        );
        expect(renderToStaticMarkup(<Application initialSubmitted />)).toContain("Application submitted");
    });
});
