export type NavbarOverlayState = {
    adminMessagesOpen: boolean;
    companyOpen: boolean;
    menuOpen: boolean;
};

export function openCompanyMenu(state: NavbarOverlayState): NavbarOverlayState {
    return {
        ...state,
        adminMessagesOpen: false,
        companyOpen: true,
        menuOpen: false,
    };
}

export function openUserMenu(state: NavbarOverlayState): NavbarOverlayState {
    return {
        ...state,
        adminMessagesOpen: false,
        companyOpen: false,
        menuOpen: true,
    };
}
