import { describe, expect, it } from "vitest";
import { normalizeActingCompany } from "./PlatformAdminContext";

describe("normalizeActingCompany", () => {
    it("returns null for malformed payloads", () => {
        expect(normalizeActingCompany(null)).toBeNull();
        expect(normalizeActingCompany({})).toBeNull();
        expect(normalizeActingCompany({ companyId: " ", companyName: "Acme" })).toBeNull();
        expect(normalizeActingCompany({ companyId: "company-1", companyName: " " })).toBeNull();
    });

    it("trims and returns a valid acting company payload", () => {
        expect(
            normalizeActingCompany({
                companyId: " company-1 ",
                companyName: " Acme Events ",
            })
        ).toEqual({
            companyId: "company-1",
            companyName: "Acme Events",
        });
    });
});
