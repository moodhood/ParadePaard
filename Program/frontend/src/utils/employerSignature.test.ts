import { describe, expect, it } from "vitest";
import { formatEmployerSignaturePlaceholder } from "./employerSignature";

describe("formatEmployerSignaturePlaceholder", () => {
    it("includes the account full name when one is available", () => {
        expect(formatEmployerSignaturePlaceholder("Benjamin Eli van Rhee"))
            .toBe("Type employer full legal name: Benjamin Eli van Rhee");
    });

    it("falls back to a generic prompt when the account name is missing", () => {
        expect(formatEmployerSignaturePlaceholder(""))
            .toBe("Type employer full legal name");
    });
});
