import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PlanningLocationPicker, {
    filterPlanningLocationSuggestions,
    movePlanningLocationSuggestionIndex,
} from "./PlanningLocationPicker";

const locations = [
    {
        locationId: "park-1",
        name: "Park Street 123",
        streetName: "Park Street",
        houseNumber: "123",
        postalCode: "1000 AA",
        city: "Amsterdam",
    },
    {
        locationId: "hall-1",
        name: "Central Hall",
        streetName: "Market Road",
        houseNumber: "8",
        city: "Rotterdam",
    },
];

describe("PlanningLocationPicker", () => {
    it("filters suggestions by location name and address", () => {
        expect(filterPlanningLocationSuggestions(locations, "park").map((location) => location.locationId))
            .toEqual(["park-1"]);
        expect(filterPlanningLocationSuggestions(locations, "market road").map((location) => location.locationId))
            .toEqual(["hall-1"]);
    });

    it("moves through suggestions with wrapping keyboard navigation", () => {
        expect(movePlanningLocationSuggestionIndex(-1, "ArrowDown", 2)).toBe(0);
        expect(movePlanningLocationSuggestionIndex(1, "ArrowDown", 2)).toBe(0);
        expect(movePlanningLocationSuggestionIndex(0, "ArrowUp", 2)).toBe(1);
    });

    it("renders an explicit-selection combobox", () => {
        const html = renderToStaticMarkup(
            <PlanningLocationPicker
                label="Location"
                value="park"
                savedLocationId={null}
                onChange={() => undefined}
            />
        );

        expect(html).toContain('role="combobox"');
        expect(html).toContain('aria-autocomplete="list"');
        expect(html).toContain('aria-expanded="false"');
    });
});
