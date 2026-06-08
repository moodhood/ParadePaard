import { describe, expect, it } from "vitest";
import {
    buildPlanningLocationAddressLines,
    buildPlanningLocationSearchText,
} from "./planningLocationAddress";

describe("planningLocationAddress", () => {
    it("formats split location address fields into two readable lines", () => {
        expect(
            buildPlanningLocationAddressLines({
                streetName: "Hoogstraat",
                houseNumber: "14",
                houseNumberSuffix: "A",
                postalCode: "3011 PV",
                city: "Rotterdam",
            })
        ).toEqual({
            line1: "Hoogstraat 14A",
            line2: "3011 PV Rotterdam",
        });
    });

    it("builds searchable text from every address field without blank gaps", () => {
        expect(
            buildPlanningLocationSearchText({
                streetName: "Hoogstraat",
                houseNumber: "14",
                houseNumberSuffix: "A",
                postalCode: "3011 PV",
                city: "Rotterdam",
            })
        ).toBe("hoogstraat 14 a 3011 pv rotterdam");
    });
});
