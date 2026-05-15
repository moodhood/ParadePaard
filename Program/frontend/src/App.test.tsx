import { describe, expect, it } from "vitest";
import { contractSignPath } from "./App";

describe("contractSignPath", () => {
    it("builds the dedicated contract signing route", () => {
        expect(contractSignPath("9faea22b-e7c6-4965-99cf-8172ab9e89fe"))
            .toBe("/contracts/9faea22b-e7c6-4965-99cf-8172ab9e89fe/sign");
    });
});
