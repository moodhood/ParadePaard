export type PlanningSearchableEntry = {
    searchText: string;
};

type PlanningSearchValue = string | null | undefined;

function normalizePlanningSearchText(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getPlanningSearchTerms(searchQuery: string): string[] {
    const normalized = normalizePlanningSearchText(searchQuery);
    return normalized ? normalized.split(" ") : [];
}

export function buildPlanningSearchText(values: PlanningSearchValue[]): string {
    return normalizePlanningSearchText(
        values
            .map((value) => value?.trim() ?? "")
            .filter(Boolean)
            .join(" ")
    );
}

export function filterPlanningSearchableEntries<TEntry extends PlanningSearchableEntry>(
    entries: TEntry[],
    searchQuery: string
): TEntry[] {
    const terms = getPlanningSearchTerms(searchQuery);

    if (terms.length === 0) {
        return entries;
    }

    return entries.filter((entry) => {
        const searchText = normalizePlanningSearchText(entry.searchText);
        return terms.every((term) => searchText.includes(term));
    });
}
