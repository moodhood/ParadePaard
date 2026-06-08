import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import PlanningLocationAddressFields from "./PlanningLocationAddressFields";

describe("PlanningLocationAddressFields", () => {
    it("renders the split address inputs for saved planning locations", () => {
        const html = renderToStaticMarkup(
            <PlanningLocationAddressFields
                value={{
                    streetName: "",
                    houseNumber: "",
                    houseNumberSuffix: "",
                    postalCode: "",
                    city: "",
                }}
                onChange={vi.fn()}
            />
        );

        expect(html).toContain("Street name");
        expect(html).toContain("House number");
        expect(html).toContain("Suffix");
        expect(html).toContain("Postal code");
        expect(html).toContain("City");
    });
});
