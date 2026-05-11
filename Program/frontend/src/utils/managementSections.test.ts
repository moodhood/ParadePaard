import { describe, expect, it } from "vitest";
import { buildManagementSections } from "./managementSections";
import type { NavItem } from "./permissionPolicy";

describe("managementSections", () => {
    it("groups allowed management cards into visible work areas and omits empty sections", () => {
        const items: NavItem[] = [
            { label: "Users", to: "/management/users", permissions: ["CAN_VIEW_USERS"] },
            { label: "Onboarding", to: "/management/onboarding", permissions: ["CAN_ONBOARD_USERS"] },
            { label: "Planning", to: "/management/planning", permissions: ["CAN_MANAGE_PLANNING"] },
            { label: "Clients", to: "/management/clients", permissions: ["CAN_MANAGE_PLANNING"] },
            { label: "All payslips", to: "/payslips?scope=all", permissions: ["CAN_VIEW_ALL_PAYSLIPS"] },
        ];

        const sections = buildManagementSections(items);

        expect(sections.map((section) => section.title)).toEqual(["People", "Planning", "Payroll"]);
        expect(sections[0]?.items.map((item) => item.label)).toEqual(["Users", "Onboarding"]);
        expect(sections[1]?.items.map((item) => item.label)).toEqual(["Planning", "Clients"]);
        expect(sections[2]?.items.map((item) => item.label)).toEqual(["All payslips"]);
    });

    it("keeps unrecognized management cards available under Other tools", () => {
        const sections = buildManagementSections([
            { label: "Special report", to: "/management/reports", permissions: ["CAN_SPECIAL_REPORT"] },
        ]);

        expect(sections).toHaveLength(1);
        expect(sections[0]?.title).toBe("Other tools");
        expect(sections[0]?.items[0]?.label).toBe("Special report");
    });
});
