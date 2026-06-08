# Navbar Mixed Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing navbar search so it shows permission-aware page results alongside user results, with clear `Page`/`User` labeling and keyboard selection support.

**Architecture:** Keep the current search input in `Navbar.tsx`, but move page-catalog and mixed-result ranking logic into focused utilities. Test most behavior through pure helpers and keep the component edits limited to rendering, highlighted-index state, and navigation wiring.

**Tech Stack:** React 19, TypeScript, React Router 7, Vitest, existing permission-policy utilities, existing navbar CSS

---

## File Structure

### Existing files to modify

- `Program/frontend/src/components/Navbar.tsx`
  - Keep the existing search field.
  - Merge user and page results into one dropdown.
  - Add highlighted-index state and keyboard navigation.
- `Program/frontend/src/components/Navbar.test.tsx`
  - Extend current navbar tests with mixed-result rendering checks that still work with `renderToStaticMarkup`.
- `Program/frontend/src/stylesheets/Navbar.css`
  - Add mixed-result row styling, type pills, highlighted row state, and secondary text layout.

### New files to create

- `Program/frontend/src/utils/navbarSearchPages.ts`
  - Build the direct navigable page catalog from current permissions and existing nav definitions.
- `Program/frontend/src/utils/navbarSearchPages.test.ts`
  - Test permission filtering and route inclusion/exclusion rules for page results.
- `Program/frontend/src/utils/navbarSearch.ts`
  - Normalize and merge page/user results, compute match strength, and expose ordering helpers plus highlighted-index helpers.
- `Program/frontend/src/utils/navbarSearch.test.ts`
  - Test mixed search behavior, ordering, and keyboard-index logic without needing a DOM test environment.

The plan intentionally avoids adding a new library such as Testing Library. The repo currently uses server-rendered markup tests heavily, and the core search logic can be validated more reliably through pure TypeScript helpers.

---

### Task 1: Add a Permission-Aware Searchable Page Catalog

**Files:**
- Create: `Program/frontend/src/utils/navbarSearchPages.ts`
- Create: `Program/frontend/src/utils/navbarSearchPages.test.ts`
- Test: `Program/frontend/src/utils/navbarSearchPages.test.ts`

- [ ] **Step 1: Write the failing page-catalog test**

Create `Program/frontend/src/utils/navbarSearchPages.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { getSearchableNavbarPages } from "./navbarSearchPages";

describe("navbarSearchPages", () => {
    it("returns direct pages the user can navigate to from the navbar and management nav", () => {
        const pages = getSearchableNavbarPages(["CAN_ONBOARD_USERS", "CAN_MANAGE_TIMESHEETS"]).map((page) => ({
            label: page.label,
            to: page.to,
            kind: page.kind,
            section: page.section,
        }));

        expect(pages).toEqual(
            expect.arrayContaining([
                { label: "Dashboard", to: "/dashboard", kind: "page", section: "Main" },
                { label: "Onboarding", to: "/management/onboarding", kind: "page", section: "Management" },
                { label: "Travel claims", to: "/management/travel-claims", kind: "page", section: "Management" },
                { label: "Work history", to: "/work-history", kind: "page", section: "Main" },
            ])
        );
    });

    it("does not include restricted or deep-link-only pages", () => {
        const pages = getSearchableNavbarPages(["CAN_VIEW_PAYSLIPS"]).map((page) => page.to);

        expect(pages).toContain("/payslips");
        expect(pages).not.toContain("/management/onboarding");
        expect(pages).not.toContain("/management/users/:userId");
        expect(pages).not.toContain("/work-history/:timesheetId");
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- navbarSearchPages.test.ts
```

Expected:
- FAIL with a module-not-found error for `./navbarSearchPages`

- [ ] **Step 3: Add the minimal page-catalog implementation**

Create `Program/frontend/src/utils/navbarSearchPages.ts` with:

```ts
import {
    canAccessCompanySettings,
    canAccessManagement,
    canViewPayslips,
    getManagementNavItems,
    type PermissionName,
} from "./permissionPolicy";

export type NavbarSearchPage = {
    kind: "page";
    label: string;
    to: string;
    section: "Main" | "Management";
    searchText: string;
};

const MAIN_PAGES: NavbarSearchPage[] = [
    { kind: "page", label: "Dashboard", to: "/dashboard", section: "Main", searchText: "dashboard home" },
    { kind: "page", label: "Contracts", to: "/account/employment", section: "Main", searchText: "contracts employment account" },
    { kind: "page", label: "My planning", to: "/my-planning", section: "Main", searchText: "planning schedule shifts my planning" },
    { kind: "page", label: "Work history", to: "/work-history", section: "Main", searchText: "work history timesheets" },
    { kind: "page", label: "Messages", to: "/messages", section: "Main", searchText: "messages inbox chat" },
    { kind: "page", label: "Account", to: "/account", section: "Main", searchText: "account profile settings" },
];

export function getSearchableNavbarPages(
    permissions: readonly PermissionName[] | null | undefined
): NavbarSearchPage[] {
    const pages = [...MAIN_PAGES];

    if (canAccessManagement(permissions)) {
        pages.push({ kind: "page", label: "Management", to: "/management", section: "Management", searchText: "management admin" });
    }

    if (canViewPayslips(permissions)) {
        pages.push({ kind: "page", label: "Payslips", to: "/payslips", section: "Main", searchText: "payslips payroll salary" });
    }

    pages.push(
        ...getManagementNavItems(permissions)
            .filter((item) => item.label !== "Messages")
            .map((item) => ({
                kind: "page" as const,
                label: item.label,
                to: item.to,
                section: "Management" as const,
                searchText: `${item.label} management ${item.to}`.toLowerCase(),
            }))
    );

    if (canAccessCompanySettings(permissions)) {
        pages.push({
            kind: "page",
            label: "Company settings",
            to: "/account/company",
            section: "Management",
            searchText: "company settings roles management",
        });
    }

    return pages.filter(
        (page, index, all) => all.findIndex((candidate) => candidate.to === page.to && candidate.label === page.label) === index
    );
}
```

Do not add any detail routes or parameterized routes here.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- navbarSearchPages.test.ts
```

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add Program/frontend/src/utils/navbarSearchPages.ts Program/frontend/src/utils/navbarSearchPages.test.ts
git commit -m "feat: add permission-aware navbar page search catalog"
```

---

### Task 2: Add Mixed Search Ranking and Keyboard Helpers

**Files:**
- Create: `Program/frontend/src/utils/navbarSearch.ts`
- Create: `Program/frontend/src/utils/navbarSearch.test.ts`
- Test: `Program/frontend/src/utils/navbarSearch.test.ts`

- [ ] **Step 1: Write the failing mixed-search helper tests**

Create `Program/frontend/src/utils/navbarSearch.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import {
    buildNavbarSearchResults,
    getNextHighlightedIndex,
    type NavbarSearchUserCandidate,
} from "./navbarSearch";
import type { NavbarSearchPage } from "./navbarSearchPages";

const pages: NavbarSearchPage[] = [
    { kind: "page", label: "Travel claims", to: "/management/travel-claims", section: "Management", searchText: "travel claims management" },
    { kind: "page", label: "Onboarding", to: "/management/onboarding", section: "Management", searchText: "onboarding management users" },
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
        const results = buildNavbarSearchResults("onboarding", pages, users);

        expect(results.map((result) => result.label)).toEqual(["Onboarding"]);
    });

    it("cycles highlighted index through visible results with arrow keys", () => {
        expect(getNextHighlightedIndex(-1, 3, "ArrowDown")).toBe(0);
        expect(getNextHighlightedIndex(0, 3, "ArrowDown")).toBe(1);
        expect(getNextHighlightedIndex(1, 3, "ArrowUp")).toBe(0);
        expect(getNextHighlightedIndex(0, 3, "ArrowUp")).toBe(2);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- navbarSearch.test.ts
```

Expected:
- FAIL with a module-not-found error for `./navbarSearch`

- [ ] **Step 3: Add the minimal ranking and highlight helpers**

Create `Program/frontend/src/utils/navbarSearch.ts` with:

```ts
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

function normalize(value: string) {
    return value.trim().toLowerCase();
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

    const pageResults: NavbarSearchResult[] = pages
        .map((page) => {
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
        .filter((result): result is NavbarSearchResult => result !== null)
        .sort((a, b) => b.matchStrength - a.matchStrength || a.label.localeCompare(b.label));

    const userResults: NavbarSearchResult[] = users
        .map((user) => {
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
        .filter((result): result is NavbarSearchResult => result !== null)
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
```

Keep this helper pure. Do not include React state here.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- navbarSearch.test.ts
```

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add Program/frontend/src/utils/navbarSearch.ts Program/frontend/src/utils/navbarSearch.test.ts
git commit -m "feat: add mixed navbar search ranking helpers"
```

---

### Task 3: Integrate Mixed Results and Keyboard Navigation into the Navbar

**Files:**
- Modify: `Program/frontend/src/components/Navbar.tsx`
- Modify: `Program/frontend/src/components/Navbar.test.tsx`
- Test: `Program/frontend/src/components/Navbar.test.tsx`

- [ ] **Step 1: Write the failing navbar rendering test**

Update `Program/frontend/src/components/Navbar.test.tsx` with:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "./Navbar";

let permissions: string[] = [];

vi.mock("../context/AuthContext", () => ({
    useAuth: () => ({
        setStatus: vi.fn(),
        permissions,
        hasPermission: (permission: string) => permissions.includes(permission),
    }),
}));

vi.mock("../services/user-service/UserServices", () => ({
    UserServices: {
        getAdminMessageConversations: vi.fn().mockResolvedValue([]),
        getMe: vi.fn().mockResolvedValue({ email: "sanne.admin@example.com", firstNames: "Sanne", middleNamePrefix: "", lastName: "Admin", preferredName: "" }),
        getMyProfilePicture: vi.fn().mockResolvedValue(null),
        getMyCompany: vi.fn().mockResolvedValue({ name: "Default Company" }),
        getUsers: vi.fn().mockResolvedValue([]),
    },
}));

vi.mock("../utils/navbarSearchPages", () => ({
    getSearchableNavbarPages: () => [
        { kind: "page", label: "Onboarding", to: "/management/onboarding", section: "Management", searchText: "onboarding management" },
    ],
}));

describe("Navbar", () => {
    beforeEach(() => {
        permissions = [];
    });

    it("renders a top-left previous-page arrow", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(html).toContain('aria-label="Go to previous page"');
    });

    it("renders an admin message icon next to the account menu for message admins", () => {
        permissions = ["CAN_MANAGE_MESSAGES"];

        const html = renderToStaticMarkup(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(html).toContain('aria-label="Open shared admin inbox"');
        expect(html.indexOf('aria-label="Open shared admin inbox"')).toBeLessThan(
            html.indexOf('aria-label="Open user menu"')
        );
    });

    it("renders page and user result metadata with distinct type labels", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(html).toContain("Search users and pages");
    });
});
```

The new assertion is intentionally weak at first. Its purpose is to force the navbar placeholder and dropdown rendering changes into place without requiring a DOM interaction library.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- Navbar.test.tsx
```

Expected:
- FAIL because the existing navbar still renders `Search users` instead of the mixed-search text and metadata

- [ ] **Step 3: Implement the navbar mixed-search integration**

Update `Program/frontend/src/components/Navbar.tsx` with these focused changes:

1. Add imports:

```ts
import {
    buildNavbarSearchResults,
    getNextHighlightedIndex,
    type NavbarSearchResult,
    type NavbarSearchUserCandidate,
} from "../utils/navbarSearch";
import { getSearchableNavbarPages } from "../utils/navbarSearchPages";
```

2. Replace the old `searchResults` memo with page-aware result building:

```ts
const searchablePages = useMemo(() => getSearchableNavbarPages(permissions), [permissions]);

const searchableUsers = useMemo<NavbarSearchUserCandidate[]>(() => {
    return users.map((user) => ({
        userId: user.userId,
        displayName: displayNameForUser(user),
        email: user.email,
        preferredName: user.preferredName ?? "",
    }));
}, [users]);

const searchResults = useMemo(() => {
    return buildNavbarSearchResults(searchTerm, searchablePages, searchableUsers).slice(0, 8);
}, [searchTerm, searchablePages, searchableUsers]);
```

3. Track highlighted selection:

```ts
const [highlightedIndex, setHighlightedIndex] = useState(-1);
```

4. Reset highlight when the term changes or the dropdown closes:

```ts
useEffect(() => {
    setHighlightedIndex(-1);
}, [searchTerm, searchOpen]);
```

5. Replace the old placeholder and input handlers:

```tsx
<input
    className="nav_search_input"
    type="search"
    placeholder="Search users and pages"
    aria-label="Search users and pages"
    value={searchTerm}
    onFocus={() => setSearchOpen(true)}
    onChange={(e) => {
        setSearchTerm(e.target.value);
        setSearchOpen(true);
    }}
    onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setSearchOpen(true);
            setHighlightedIndex((current) => getNextHighlightedIndex(current, searchResults.length, event.key));
            return;
        }

        if (event.key === "Enter") {
            const selected = highlightedIndex >= 0 ? searchResults[highlightedIndex] : null;
            if (!selected) return;
            event.preventDefault();
            if (selected.type === "page") {
                setSearchTerm("");
                setSearchOpen(false);
                navigate(selected.to);
                return;
            }
            setSearchTerm("");
            setSearchOpen(false);
            navigate(`/management/users/${selected.userId}`);
        }
    }}
    disabled={loggingOut}
/>
```

6. Replace the old user-only result rendering with mixed rows:

```tsx
{searchOpen ? (
    <div className="nav_search_results" role="listbox">
        {searchLoading && searchTerm.trim().length > 0 && searchUsersLoaded === false ? (
            <div className="nav_search_empty">Loading users...</div>
        ) : searchTerm.trim().length === 0 ? (
            <div className="nav_search_empty">Start typing to search.</div>
        ) : searchResults.length === 0 ? (
            <div className="nav_search_empty">No matches found.</div>
        ) : (
            searchResults.map((result, index) => (
                <button
                    key={result.type === "page" ? `page:${result.to}` : `user:${result.userId}`}
                    type="button"
                    className={`nav_search_item${highlightedIndex === index ? " nav_search_item--active" : ""}`}
                    role="option"
                    aria-selected={highlightedIndex === index}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => {
                        setSearchTerm("");
                        setSearchOpen(false);
                        if (result.type === "page") {
                            navigate(result.to);
                            return;
                        }
                        navigate(`/management/users/${result.userId}`);
                    }}
                >
                    <div className="nav_search_item_top">
                        <span className="nav_search_name">{result.label}</span>
                        <span className={`nav_search_type nav_search_type--${result.type}`}>
                            {result.type === "page" ? "Page" : "User"}
                        </span>
                    </div>
                    <span className="nav_search_email">{result.secondaryLabel}</span>
                </button>
            ))
        )}
    </div>
) : null}
```

Do not navigate on bare `Enter` if `highlightedIndex === -1`.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- Navbar.test.tsx
```

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add Program/frontend/src/components/Navbar.tsx Program/frontend/src/components/Navbar.test.tsx
git commit -m "feat: add mixed navbar search behavior"
```

---

### Task 4: Add the Mixed Result UI Styling and Final Verification

**Files:**
- Modify: `Program/frontend/src/stylesheets/Navbar.css`
- Test: `Program/frontend/src/utils/navbarSearchPages.test.ts`
- Test: `Program/frontend/src/utils/navbarSearch.test.ts`
- Test: `Program/frontend/src/components/Navbar.test.tsx`

- [ ] **Step 1: Add a style-focused regression assertion**

Extend `Program/frontend/src/components/Navbar.test.tsx` with:

```tsx
import { readFileSync } from "node:fs";

it("styles mixed navbar search rows with a distinct result type pill and active state", () => {
    const navbarCss = readFileSync(new URL("../stylesheets/Navbar.css", import.meta.url), "utf8");

    expect(navbarCss).toContain(".nav_search_item_top");
    expect(navbarCss).toContain(".nav_search_type");
    expect(navbarCss).toContain(".nav_search_item--active");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- Navbar.test.tsx
```

Expected:
- FAIL because the new CSS selectors do not exist yet

- [ ] **Step 3: Add the dropdown styling**

Update `Program/frontend/src/stylesheets/Navbar.css` with:

```css
.nav_search_item {
    width: 100%;
    text-align: left;
    background: transparent;
    border: 0;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.nav_search_item_top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.nav_search_item--active,
.nav_search_item:hover {
    background: rgba(47, 107, 255, 0.08);
}

.nav_search_type {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 22px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.02em;
    white-space: nowrap;
}

.nav_search_type--page {
    background: #e8f0ff;
    color: #1d4ed8;
}

.nav_search_type--user {
    background: #eef2f7;
    color: #475569;
}
```

Keep the existing dropdown shell and spacing unless a conflict appears during browser verification.

- [ ] **Step 4: Run the focused verification suite**

Run:

```bash
npm test -- navbarSearchPages.test.ts navbarSearch.test.ts Navbar.test.tsx
```

Expected:
- PASS

Then run:

```bash
npm run build
```

Expected:
- If it fails, confirm whether the failures are in touched files or unrelated pre-existing files.
- Do not claim a clean build if unrelated repo errors still block it.

Then verify in the browser:

1. Log in with a user that has management permissions.
2. Type `onboarding` and confirm a `Page` result appears.
3. Type `tra` and confirm both a `Page` result like `Travel claims` and a `User` result can appear when data matches.
4. Use `ArrowDown` / `ArrowUp` and `Enter` to select a highlighted result.
5. Confirm inaccessible pages never appear for a lower-permission account.

- [ ] **Step 5: Commit**

```bash
git add Program/frontend/src/stylesheets/Navbar.css Program/frontend/src/components/Navbar.test.tsx
git commit -m "style: refine mixed navbar search results"
```

---

## Self-Review

### Spec coverage

Spec requirement to task mapping:
- mixed dropdown: Task 3
- `Page` / `User` labels: Tasks 3 and 4
- only direct navigable pages: Task 1
- permission filtering: Task 1
- no detail pages: Task 1
- pages before users: Task 2
- arrow keys plus `Enter`: Task 3
- no action on bare `Enter`: Task 3
- empty/loading/error states: Task 3
- focused tests: Tasks 1 through 4

No spec gaps remain.

### Placeholder scan

Checked for:
- `TODO`
- `TBD`
- “appropriate error handling”
- “write tests for the above”
- “similar to task”

None remain.

### Type consistency

Types used consistently across tasks:
- `NavbarSearchPage`
- `NavbarSearchUserCandidate`
- `NavbarSearchResult`
- `highlightedIndex`
- `getSearchableNavbarPages`
- `buildNavbarSearchResults`
- `getNextHighlightedIndex`

No naming drift remains.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-05-navbar-mixed-search-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
