import { describe, expect, it } from "vitest";
import {
    buildNavbarSearchResults,
    getNextHighlightedIndex,
    type NavbarSearchUserCandidate,
} from "./navbarSearch";
import type { NavbarSearchPage } from "./navbarSearchPages";

const pages: NavbarSearchPage[] = [
    {
        kind: "page",
        label: "Travel claims",
        to: "/management/travel-claims",
        section: "Management",
        searchText: "travel claims management",
    },
    {
        kind: "page",
        label: "Applications",
        to: "/management/applications",
        section: "Management",
        searchText: "applications management applicants",
    },
];

const users: NavbarSearchUserCandidate[] = [
    { userId: "user-1", displayName: "Tracy Adams", email: "tracy@example.com", preferredName: "Tracy" },
    { userId: "user-2", displayName: "Ada Lovelace", email: "ada@example.com", preferredName: "" },
];

describe("navbarSearch", () => {
    it("returns both page and user results for overlapping queries, with pages first", () => {
        const results = buildNavbarSearchResults("tra", pages, users);

        expect(results.map((result) => `${result.type}:${result.label}`)).toEqual([
            "page:Travel claims",
            "user:Tracy Adams",
        ]);
    });

    it("keeps exact page-intent queries available without auto-selecting anything", () => {
        const results = buildNavbarSearchResults("applications", pages, users);

        expect(results.map((result) => result.label)).toEqual(["Applications"]);
    });

    it("cycles highlighted index through visible results with arrow keys", () => {
        expect(getNextHighlightedIndex(-1, 3, "ArrowDown")).toBe(0);
        expect(getNextHighlightedIndex(0, 3, "ArrowDown")).toBe(1);
        expect(getNextHighlightedIndex(1, 3, "ArrowUp")).toBe(0);
        expect(getNextHighlightedIndex(0, 3, "ArrowUp")).toBe(2);
    });
});
