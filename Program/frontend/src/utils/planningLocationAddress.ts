export type PlanningLocationAddressFieldsValue = {
    streetName?: string | null;
    houseNumber?: string | null;
    houseNumberSuffix?: string | null;
    postalCode?: string | null;
    city?: string | null;
};

function normalizeAddressPart(value?: string | null): string {
    return typeof value === "string" ? value.trim() : "";
}

export function buildPlanningLocationAddressLines(value: PlanningLocationAddressFieldsValue): {
    line1: string | null;
    line2: string | null;
} {
    const streetName = normalizeAddressPart(value.streetName);
    const houseNumber = normalizeAddressPart(value.houseNumber);
    const houseNumberSuffix = normalizeAddressPart(value.houseNumberSuffix);
    const postalCode = normalizeAddressPart(value.postalCode);
    const city = normalizeAddressPart(value.city);

    const line1 = [streetName, `${houseNumber}${houseNumberSuffix}`.trim()].filter(Boolean).join(" ") || null;
    const line2 = [postalCode, city].filter(Boolean).join(" ") || null;

    return { line1, line2 };
}

export function buildPlanningLocationSearchText(value: PlanningLocationAddressFieldsValue): string {
    return [
        normalizeAddressPart(value.streetName),
        normalizeAddressPart(value.houseNumber),
        normalizeAddressPart(value.houseNumberSuffix),
        normalizeAddressPart(value.postalCode),
        normalizeAddressPart(value.city),
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
}
