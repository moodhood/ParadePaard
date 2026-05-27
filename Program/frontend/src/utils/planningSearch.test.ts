import { describe, expect, it } from "vitest";
import {
    buildPlanningSearchText,
    filterPlanningSearchableEntries,
} from "./planningSearch";

type SearchableEntry = {
    id: string;
    searchText: string;
};

describe("planningSearch", () => {
    it("filters planning entries by project, client, and assigned user text", () => {
        const entries: SearchableEntry[] = [
            {
                id: "gala-host",
                searchText: buildPlanningSearchText([
                    "Spring Gala",
                    "Northwind Events",
                    "Anna Jansen",
                ]),
            },
            {
                id: "conference-security",
                searchText: buildPlanningSearchText([
                    "Tech Conference",
                    "Contoso",
                    "Bram Smit",
                ]),
            },
            {
                id: "market-open-shift",
                searchText: buildPlanningSearchText([
                    "Market Weekend",
                    "City Events",
                    null,
                ]),
            },
        ];

        expect(filterPlanningSearchableEntries(entries, "spring").map((entry) => entry.id)).toEqual(["gala-host"]);
        expect(filterPlanningSearchableEntries(entries, "contoso").map((entry) => entry.id)).toEqual(["conference-security"]);
        expect(filterPlanningSearchableEntries(entries, "anna").map((entry) => entry.id)).toEqual(["gala-host"]);
    });

    it("requires every search term to match but ignores case and extra spacing", () => {
        const entries: SearchableEntry[] = [
            {
                id: "match",
                searchText: buildPlanningSearchText(["Breda City Run", "JAM Events", "Femke Klijsen"]),
            },
            {
                id: "miss",
                searchText: buildPlanningSearchText(["Breda City Run", "JAM Events", "Lars Bakker"]),
            },
        ];

        expect(filterPlanningSearchableEntries(entries, "  FEMKE   breda ").map((entry) => entry.id)).toEqual(["match"]);
    });
});
