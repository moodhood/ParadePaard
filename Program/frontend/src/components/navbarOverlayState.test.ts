import { describe, expect, it } from "vitest";
import { openCompanyMenu, openUserMenu, type NavbarOverlayState } from "./navbarOverlayState";

const openMessagesState: NavbarOverlayState = {
    adminMessagesOpen: true,
    companyOpen: false,
    menuOpen: false,
};

describe("navbar overlay state", () => {
    it("closes admin messages when the company menu opens", () => {
        expect(openCompanyMenu(openMessagesState)).toEqual({
            adminMessagesOpen: false,
            companyOpen: true,
            menuOpen: false,
        });
    });

    it("closes admin messages when the account menu opens", () => {
        expect(openUserMenu(openMessagesState)).toEqual({
            adminMessagesOpen: false,
            companyOpen: false,
            menuOpen: true,
        });
    });
});
