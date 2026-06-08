import type { NavbarSearchPage } from "./navbarSearchPages";

export type NavbarSearchUserCandidate = {
    userId: string;
    displayName: string;
    email: string;
    preferredName: string;
};

export type NavbarSearchResult =
    | {
          type: "page";
          label: string;
          secondaryLabel: string;
          to: string;
          matchStrength: number;
      }
    | {
          type: "user";
          label: string;
          secondaryLabel: string;
          userId: string;
          matchStrength: number;
      };

type PageSearchResult = Extract<NavbarSearchResult, { type: "page" }>;
type UserSearchResult = Extract<NavbarSearchResult, { type: "user" }>;

function normalize(value: string) {
    return value.trim().toLowerCase();
}

function isPresent<T>(value: T | null): value is T {
    return value !== null;
}

function rankMatch(term: string, value: string) {
    const normalizedValue = normalize(value);
    if (!normalizedValue.includes(term)) return -1;
    if (normalizedValue === term) return 300;
    if (normalizedValue.startsWith(term)) return 200;
    return 100;
}

export function buildNavbarSearchResults(
    searchTerm: string,
    pages: readonly NavbarSearchPage[],
    users: readonly NavbarSearchUserCandidate[]
): NavbarSearchResult[] {
    const term = normalize(searchTerm);
    if (!term) return [];

    const pageResults = pages
        .map<PageSearchResult | null>((page) => {
            const matchStrength = Math.max(rankMatch(term, page.label), rankMatch(term, page.searchText));
            if (matchStrength < 0) return null;

            return {
                type: "page" as const,
                label: page.label,
                secondaryLabel: page.section,
                to: page.to,
                matchStrength,
            };
        })
        .filter(isPresent)
        .sort((a, b) => b.matchStrength - a.matchStrength || a.label.localeCompare(b.label));

    const userResults = users
        .map<UserSearchResult | null>((user) => {
            const matchStrength = Math.max(
                rankMatch(term, user.displayName),
                rankMatch(term, user.preferredName),
                rankMatch(term, user.email)
            );
            if (matchStrength < 0) return null;

            return {
                type: "user" as const,
                label: user.displayName,
                secondaryLabel: user.email,
                userId: user.userId,
                matchStrength,
            };
        })
        .filter(isPresent)
        .sort((a, b) => b.matchStrength - a.matchStrength || a.label.localeCompare(b.label));

    return [...pageResults, ...userResults];
}

export function getNextHighlightedIndex(
    currentIndex: number,
    resultCount: number,
    key: "ArrowDown" | "ArrowUp"
) {
    if (resultCount <= 0) return -1;
    if (currentIndex < 0) return key === "ArrowDown" ? 0 : resultCount - 1;

    return key === "ArrowDown"
        ? (currentIndex + 1) % resultCount
        : (currentIndex - 1 + resultCount) % resultCount;
}
