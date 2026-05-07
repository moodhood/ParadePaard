# Permission Role Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the frontend admin flow with a permission-based My Work and Management flow, where Admin is only a role preset with broad permissions.

**Architecture:** Centralize permissions in `AuthContext`, define shared permission-policy helpers, and route every management page through permission guards. Keep existing large page components in place during the first pass, but expose them through `/management/*` routes and permission-aware navigation.

**Tech Stack:** React 19, React Router 7, TypeScript, Vite, Axios, Vitest for new permission-policy tests.

---

## Scope Check

This plan implements the approved frontend permission-flow design in one coherent refactor. Backend authorization already exposes permission-based endpoints, so backend changes are out of scope unless build or API verification exposes a frontend/backend mismatch. Existing dirty worktree changes must be preserved and not reverted.

## File Structure

- Modify `Program/frontend/package.json`: add `test` script and Vitest dependencies.
- Create `Program/frontend/src/utils/permissionPolicy.ts`: single source for management permission groups and pure access helpers.
- Create `Program/frontend/src/utils/permissionPolicy.test.ts`: unit tests for permission-policy helpers.
- Modify `Program/frontend/src/context/AuthContext.tsx`: expose permissions and helper functions.
- Modify `Program/frontend/src/components/RequirePermission.tsx`: support one permission, all permissions, or any permission.
- Delete `Program/frontend/src/components/RequireAdmin.tsx`: no frontend admin guard remains.
- Create `Program/frontend/src/pages/Management.tsx`: permission-based management dashboard.
- Create `Program/frontend/src/stylesheets/Management.css`: management dashboard layout.
- Modify `Program/frontend/src/App.tsx`: add `/management/*` routes and redirects from old `/admin/*` paths.
- Modify `Program/frontend/src/pages/Dashboard.tsx`: always show the personal dashboard.
- Modify `Program/frontend/src/components/PrimaryNav.tsx`: show My Work and Management groups from permissions.
- Modify `Program/frontend/src/components/Navbar.tsx`: remove admin switch, make user search permission-based, keep company settings permission-based.
- Modify `Program/frontend/src/pages/Account.tsx`: remove `view=personal` handling and rely on route permission for company settings.
- Modify `Program/frontend/src/pages/WorkHistory.tsx`: remove `view=personal` handling; use permission scope directly.
- Modify `Program/frontend/src/pages/Payslips.tsx`: remove `view=personal` handling; use permission scope directly.
- Modify `Program/frontend/src/pages/MyPlanning.tsx`, `Program/frontend/src/pages/MyPlanningShiftDetail.tsx`, and `Program/frontend/src/pages/WorkHistoryShiftDetail.tsx`: remove personal-view query propagation.
- Modify management pages that link to old admin URLs: update links and navigations to `/management/*`.
- Modify `Project Plan/Rundown/ParadePaardRundown.tex` and rebuild `Project Plan/Rundown/ParadePaardRundown.pdf` after implementation.

---

### Task 1: Add Permission-Policy Tests And Test Runner

**Files:**
- Modify: `Program/frontend/package.json`
- Create: `Program/frontend/src/utils/permissionPolicy.test.ts`

- [ ] **Step 1: Add the test script and test dependency**

In `Program/frontend/package.json`, add the `test` script:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

Run:

```bash
cd Program/frontend
npm install -D vitest
```

Expected: `package-lock.json` updates and exits with code 0.

- [ ] **Step 2: Write failing permission-policy tests**

Create `Program/frontend/src/utils/permissionPolicy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
    canAccessManagement,
    canAccessCompanySettings,
    canViewPayslips,
    getManagementNavItems,
    hasAnyPermission,
    hasPermission,
} from "./permissionPolicy";

describe("permissionPolicy", () => {
    it("checks exact and any-of permission matches", () => {
        const permissions = ["CAN_VIEW_USERS", "CAN_MANAGE_PLANNING"];

        expect(hasPermission(permissions, "CAN_VIEW_USERS")).toBe(true);
        expect(hasPermission(permissions, "CAN_MANAGE_PAYSLIPS")).toBe(false);
        expect(hasAnyPermission(permissions, ["CAN_MANAGE_PAYSLIPS", "CAN_MANAGE_PLANNING"])).toBe(true);
        expect(hasAnyPermission(permissions, ["CAN_MANAGE_PAYSLIPS", "CAN_REVIEW_PAYSLIPS"])).toBe(false);
    });

    it("treats management access as any management permission", () => {
        expect(canAccessManagement([])).toBe(false);
        expect(canAccessManagement(["CAN_VIEW_PAYSLIPS"])).toBe(false);
        expect(canAccessManagement(["CAN_MANAGE_PLANNING"])).toBe(true);
        expect(canAccessManagement(["CAN_REVIEW_PAYSLIPS"])).toBe(true);
    });

    it("keeps company settings behind company or role-management permissions", () => {
        expect(canAccessCompanySettings(["CAN_VIEW_PAYSLIPS"])).toBe(false);
        expect(canAccessCompanySettings(["CAN_MANAGE_COMPANY"])).toBe(true);
        expect(canAccessCompanySettings(["CAN_ASSIGN_ROLES"])).toBe(true);
        expect(canAccessCompanySettings(["CAN_REMOVE_ROLES"])).toBe(true);
    });

    it("shows payslips when the user can view own or all payslips", () => {
        expect(canViewPayslips([])).toBe(false);
        expect(canViewPayslips(["CAN_VIEW_PAYSLIPS"])).toBe(true);
        expect(canViewPayslips(["CAN_VIEW_ALL_PAYSLIPS"])).toBe(true);
    });

    it("builds management navigation from only allowed permissions", () => {
        const plannerItems = getManagementNavItems(["CAN_MANAGE_PLANNING"]).map((item) => item.label);
        expect(plannerItems).toEqual(["Planning", "Clients"]);

        const payrollItems = getManagementNavItems(["CAN_VIEW_ALL_PAYSLIPS", "CAN_REVIEW_PAYSLIPS"]).map(
            (item) => item.label
        );
        expect(payrollItems).toEqual(["All payslips", "Payslip review"]);
    });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
cd Program/frontend
npm test -- src/utils/permissionPolicy.test.ts
```

Expected: FAIL because `src/utils/permissionPolicy.ts` does not exist.

- [ ] **Step 4: Commit the failing tests and test setup**

```bash
git add Program/frontend/package.json Program/frontend/package-lock.json Program/frontend/src/utils/permissionPolicy.test.ts
git commit -m "Add permission policy test setup"
```

Expected: commit succeeds and contains only test setup files.

---

### Task 2: Add Shared Permission Policy Helpers

**Files:**
- Create: `Program/frontend/src/utils/permissionPolicy.ts`
- Test: `Program/frontend/src/utils/permissionPolicy.test.ts`

- [ ] **Step 1: Implement the permission-policy module**

Create `Program/frontend/src/utils/permissionPolicy.ts`:

```ts
export type PermissionName = string;

export type NavItem = {
    label: string;
    to: string;
    permissions: PermissionName[];
};

export const ROLE_MANAGEMENT_PERMISSIONS = [
    "CAN_CREATE_ROLE",
    "CAN_ASSIGN_ROLES",
    "CAN_EDIT_ROLES",
    "CAN_REMOVE_ROLES",
    "CAN_DELETE_ROLES",
];

export const COMPANY_SETTINGS_PERMISSIONS = [
    "CAN_MANAGE_COMPANY",
    ...ROLE_MANAGEMENT_PERMISSIONS,
];

export const MANAGEMENT_PERMISSIONS = [
    "CAN_ACCESS_ADMIN_DASHBOARD",
    "CAN_VIEW_USERS",
    "CAN_MANAGE_USERS",
    "CAN_ONBOARD_USERS",
    "CAN_MANAGE_PLANNING",
    "CAN_VIEW_ALL_TIMESHEETS",
    "CAN_MANAGE_TIMESHEETS",
    "CAN_VIEW_ALL_PAYSLIPS",
    "CAN_REVIEW_PAYSLIPS",
    "CAN_MANAGE_PAYSLIPS",
    "CAN_MANAGE_COMPANY",
    ...ROLE_MANAGEMENT_PERMISSIONS,
];

export const MANAGEMENT_NAV_ITEMS: NavItem[] = [
    { label: "Users", to: "/management/users", permissions: ["CAN_VIEW_USERS"] },
    { label: "Onboarding", to: "/management/onboarding", permissions: ["CAN_ONBOARD_USERS"] },
    { label: "Planning", to: "/management/planning", permissions: ["CAN_MANAGE_PLANNING"] },
    { label: "Clients", to: "/management/clients", permissions: ["CAN_MANAGE_PLANNING"] },
    { label: "Travel claims", to: "/management/travel-claims", permissions: ["CAN_MANAGE_TIMESHEETS"] },
    { label: "All payslips", to: "/payslips?scope=all", permissions: ["CAN_VIEW_ALL_PAYSLIPS"] },
    { label: "Payslip review", to: "/management/payslip-review", permissions: ["CAN_REVIEW_PAYSLIPS"] },
    { label: "Company settings", to: "/account/company", permissions: COMPANY_SETTINGS_PERMISSIONS },
];

export const hasPermission = (
    permissions: readonly PermissionName[] | null | undefined,
    permission: PermissionName
) => {
    return Boolean(permissions?.includes(permission));
};

export const hasAnyPermission = (
    permissions: readonly PermissionName[] | null | undefined,
    required: readonly PermissionName[]
) => {
    return required.some((permission) => hasPermission(permissions, permission));
};

export const hasAllPermissions = (
    permissions: readonly PermissionName[] | null | undefined,
    required: readonly PermissionName[]
) => {
    return required.every((permission) => hasPermission(permissions, permission));
};

export const canAccessManagement = (permissions: readonly PermissionName[] | null | undefined) => {
    return hasAnyPermission(permissions, MANAGEMENT_PERMISSIONS);
};

export const canAccessCompanySettings = (permissions: readonly PermissionName[] | null | undefined) => {
    return hasAnyPermission(permissions, COMPANY_SETTINGS_PERMISSIONS);
};

export const canViewPayslips = (permissions: readonly PermissionName[] | null | undefined) => {
    return hasAnyPermission(permissions, ["CAN_VIEW_PAYSLIPS", "CAN_VIEW_ALL_PAYSLIPS"]);
};

export const getManagementNavItems = (permissions: readonly PermissionName[] | null | undefined) => {
    return MANAGEMENT_NAV_ITEMS.filter((item) => hasAnyPermission(permissions, item.permissions));
};
```

- [ ] **Step 2: Run permission-policy tests**

Run:

```bash
cd Program/frontend
npm test -- src/utils/permissionPolicy.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run the frontend build**

Run:

```bash
cd Program/frontend
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit the permission-policy helper**

```bash
git add Program/frontend/src/utils/permissionPolicy.ts
git commit -m "Add shared permission policy helpers"
```

Expected: commit succeeds.

---

### Task 3: Centralize Permissions In AuthContext

**Files:**
- Modify: `Program/frontend/src/context/AuthContext.tsx`
- Modify: `Program/frontend/src/pages/Login.tsx`
- Modify: `Program/frontend/src/components/Navbar.tsx`

- [ ] **Step 1: Extend AuthContext with permissions**

Replace `Program/frontend/src/context/AuthContext.tsx` with:

```tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthServices } from "../services/auth-service/AuthServices";
import { UserServices } from "../services/user-service/UserServices";
import { readCachedPermissions, writeCachedPermissions } from "../utils/authCache";
import {
    hasAllPermissions as policyHasAllPermissions,
    hasAnyPermission as policyHasAnyPermission,
    hasPermission as policyHasPermission,
} from "../utils/permissionPolicy";

export type UserStatus = "PENDING_SETUP" | "ACTIVE";

type AuthContextValue = {
    status: UserStatus | null;
    loading: boolean;
    permissions: string[];
    permissionsLoading: boolean;
    permissionsError: string | null;
    setStatus: (status: UserStatus | null) => void;
    refreshStatus: () => Promise<void>;
    refreshPermissions: () => Promise<string[]>;
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getCachedStatus = (): UserStatus | null => {
    try {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("authToken") ||
            sessionStorage.getItem("token") ||
            sessionStorage.getItem("accessToken") ||
            sessionStorage.getItem("authToken");

        if (!token) return null;
        const cached = localStorage.getItem("userStatus");
        if (cached === "ACTIVE" || cached === "PENDING_SETUP") return cached;
        return null;
    } catch {
        return null;
    }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const cachedPermissions = useMemo(() => readCachedPermissions(), []);
    const [status, setStatus] = useState<UserStatus | null>(getCachedStatus());
    const [loading, setLoading] = useState(status === null);
    const [permissions, setPermissions] = useState<string[]>(cachedPermissions ?? []);
    const [permissionsLoading, setPermissionsLoading] = useState(status !== null && cachedPermissions === null);
    const [permissionsError, setPermissionsError] = useState<string | null>(null);

    const refreshStatus = useCallback(async () => {
        try {
            const me = await UserServices.getMe();
            setStatus((me.status as UserStatus) || null);
        } catch {
            setStatus(null);
            setPermissions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshPermissions = useCallback(async () => {
        try {
            setPermissionsLoading(true);
            setPermissionsError(null);
            const next = await AuthServices.getPermissions();
            setPermissions(next ?? []);
            writeCachedPermissions(next ?? []);
            return next ?? [];
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load permissions";
            setPermissionsError(message);
            setPermissions([]);
            return [];
        } finally {
            setPermissionsLoading(false);
        }
    }, []);

    useEffect(() => {
        void refreshStatus();
    }, [refreshStatus]);

    useEffect(() => {
        if (status === "ACTIVE") {
            void refreshPermissions();
        } else {
            setPermissions([]);
            setPermissionsLoading(false);
            setPermissionsError(null);
        }
    }, [refreshPermissions, status]);

    useEffect(() => {
        try {
            if (status) {
                localStorage.setItem("userStatus", status);
            } else {
                localStorage.removeItem("userStatus");
            }
        } catch {
            // ignore storage failures
        }
    }, [status]);

    const hasPermission = useCallback(
        (permission: string) => policyHasPermission(permissions, permission),
        [permissions]
    );

    const hasAnyPermission = useCallback(
        (required: string[]) => policyHasAnyPermission(permissions, required),
        [permissions]
    );

    const hasAllPermissions = useCallback(
        (required: string[]) => policyHasAllPermissions(permissions, required),
        [permissions]
    );

    const value = useMemo(
        () => ({
            status,
            loading,
            permissions,
            permissionsLoading,
            permissionsError,
            setStatus,
            refreshStatus,
            refreshPermissions,
            hasPermission,
            hasAnyPermission,
            hasAllPermissions,
        }),
        [
            status,
            loading,
            permissions,
            permissionsLoading,
            permissionsError,
            refreshStatus,
            refreshPermissions,
            hasPermission,
            hasAnyPermission,
            hasAllPermissions,
        ]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
```

- [ ] **Step 2: Refresh permissions after login**

In `Program/frontend/src/pages/Login.tsx`, change the auth hook line:

```tsx
const { setStatus, refreshPermissions } = useAuth();
```

After `setStatus(status);`, add:

```tsx
if (status === "ACTIVE") {
    await refreshPermissions();
}
```

Expected resulting section:

```tsx
const status = me.status === "PENDING_SETUP" ? "PENDING_SETUP" : "ACTIVE";
setStatus(status);
if (status === "ACTIVE") {
    await refreshPermissions();
}
```

- [ ] **Step 3: Clear permissions on logout**

In `Program/frontend/src/components/Navbar.tsx`, change the auth hook line:

```tsx
const { setStatus } = useAuth();
```

The new auth-context effect clears permissions when `setStatus(null)` runs, so logout should not call `refreshPermissions()`.

- [ ] **Step 4: Run tests and build**

Run:

```bash
cd Program/frontend
npm test -- src/utils/permissionPolicy.test.ts
npm run build
```

Expected: both commands PASS.

- [ ] **Step 5: Commit the central permission context**

```bash
git add Program/frontend/src/context/AuthContext.tsx Program/frontend/src/pages/Login.tsx Program/frontend/src/components/Navbar.tsx
git commit -m "Centralize frontend permissions in auth context"
```

Expected: commit succeeds.

---

### Task 4: Replace Admin Guard With Permission Guard

**Files:**
- Modify: `Program/frontend/src/components/RequirePermission.tsx`
- Delete: `Program/frontend/src/components/RequireAdmin.tsx`

- [ ] **Step 1: Replace RequirePermission implementation**

Replace `Program/frontend/src/components/RequirePermission.tsx` with:

```tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";
import { spinnerTextForPath } from "./spinnerText";

type RequirePermissionProps = {
    permission?: string;
    anyOf?: string[];
    allOf?: string[];
    children: React.ReactNode;
};

export default function RequirePermission({
    permission,
    anyOf,
    allOf,
    children,
}: RequirePermissionProps) {
    const location = useLocation();
    const { permissionsLoading, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

    if (permissionsLoading) {
        return <Spinner text={spinnerTextForPath(location.pathname)} />;
    }

    const singleAllowed = permission ? hasPermission(permission) : true;
    const anyAllowed = anyOf && anyOf.length > 0 ? hasAnyPermission(anyOf) : true;
    const allAllowed = allOf && allOf.length > 0 ? hasAllPermissions(allOf) : true;

    if (!singleAllowed || !anyAllowed || !allAllowed) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
```

- [ ] **Step 2: Delete RequireAdmin**

Delete `Program/frontend/src/components/RequireAdmin.tsx`.

- [ ] **Step 3: Run build to catch old imports**

Run:

```bash
cd Program/frontend
npm run build
```

Expected: FAIL because `App.tsx` still imports `RequireAdmin`. This confirms the old admin guard is not fully removed yet.

- [ ] **Step 4: Do not commit this task yet**

This task is intentionally completed by Task 6 when route imports are updated. Leave files modified and continue.

---

### Task 5: Add Permission-Based Management Dashboard

**Files:**
- Create: `Program/frontend/src/pages/Management.tsx`
- Create: `Program/frontend/src/stylesheets/Management.css`

- [ ] **Step 1: Create Management page**

Create `Program/frontend/src/pages/Management.tsx`:

```tsx
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import PrimaryNav from "../components/PrimaryNav";
import Card from "../components/common/Card";
import { useAuth } from "../context/AuthContext";
import { getManagementNavItems } from "../utils/permissionPolicy";
import "../stylesheets/Management.css";

const cardDescriptions: Record<string, string> = {
    Users: "Open the employee directory and inspect employee profiles.",
    Onboarding: "Invite a new employee and start their setup flow.",
    Planning: "Create events, shifts, and staffing assignments.",
    Clients: "Manage client companies used in planning.",
    "Travel claims": "Review submitted travel claims.",
    "All payslips": "Inspect company payslips by employee, date, and status.",
    "Payslip review": "Open the payroll review queue.",
    "Company settings": "Manage company details, roles, workflow, and tax settings.",
};

export default function Management() {
    const { permissions } = useAuth();
    const items = getManagementNavItems(permissions);

    return (
        <>
            <Navbar />
            <div className="managementPage">
                <div className="pageShell">
                    <PrimaryNav />
                    <main className="pageShellContent">
                        <header className="pageHeader">
                            <h1 className="pageTitle">Management</h1>
                        </header>
                        {items.length === 0 ? (
                            <Card title="No management access" className="managementNotice">
                                <p>Your account does not currently include management permissions.</p>
                            </Card>
                        ) : (
                            <div className="managementGrid">
                                {items.map((item) => (
                                    <Card key={item.label} title={item.label} className="managementCard">
                                        <p className="managementCardText">
                                            {cardDescriptions[item.label] ?? "Open this management workspace."}
                                        </p>
                                        <Link className="button" to={item.to}>
                                            Open
                                        </Link>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
```

- [ ] **Step 2: Create Management stylesheet**

Create `Program/frontend/src/stylesheets/Management.css`:

```css
.managementPage {
    min-height: 100vh;
    background: #f6f7fb;
}

.managementGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
}

.managementCard {
    min-height: 160px;
}

.managementCardText {
    color: #4b5563;
    line-height: 1.5;
    margin: 0 0 18px;
}

.managementNotice p {
    margin: 0;
    color: #4b5563;
}
```

- [ ] **Step 3: Run build**

Run:

```bash
cd Program/frontend
npm run build
```

Expected: still FAIL because Task 4 removed `RequireAdmin` but routes have not been updated. Continue to Task 6.

---

### Task 6: Convert Routes From Admin To Management Permissions

**Files:**
- Modify: `Program/frontend/src/App.tsx`

- [ ] **Step 1: Update imports**

In `Program/frontend/src/App.tsx`, remove:

```tsx
import RequireAdmin from "./components/RequireAdmin";
```

Add:

```tsx
import Management from "./pages/Management";
import { COMPANY_SETTINGS_PERMISSIONS, MANAGEMENT_PERMISSIONS } from "./utils/permissionPolicy";
```

- [ ] **Step 2: Replace route tree with permission routes and legacy redirects**

Use these route elements for the management routes:

```tsx
<Route
    path="/management"
    element={
        <RequireActiveUser>
            <RequirePermission anyOf={MANAGEMENT_PERMISSIONS}>
                <Management />
            </RequirePermission>
        </RequireActiveUser>
    }
/>
<Route
    path="/management/users"
    element={
        <RequireActiveUser>
            <RequirePermission permission="CAN_VIEW_USERS">
                <AdminUsers />
            </RequirePermission>
        </RequireActiveUser>
    }
/>
<Route
    path="/management/users/:userId"
    element={
        <RequireActiveUser>
            <RequirePermission permission="CAN_VIEW_USERS">
                <AdminUserDetails />
            </RequirePermission>
        </RequireActiveUser>
    }
/>
<Route
    path="/management/onboarding"
    element={
        <RequireActiveUser>
            <RequirePermission permission="CAN_ONBOARD_USERS">
                <AdminOnboarding />
            </RequirePermission>
        </RequireActiveUser>
    }
/>
<Route
    path="/management/payslip-review"
    element={
        <RequireActiveUser>
            <RequirePermission permission="CAN_REVIEW_PAYSLIPS">
                <PayslipReview />
            </RequirePermission>
        </RequireActiveUser>
    }
/>
<Route
    path="/management/payslips/:payslipId"
    element={
        <RequireActiveUser>
            <RequirePermission permission="CAN_VIEW_ALL_PAYSLIPS">
                <AdminPayslipDetails />
            </RequirePermission>
        </RequireActiveUser>
    }
/>
<Route
    path="/management/planning"
    element={
        <RequireActiveUser>
            <RequirePermission permission="CAN_MANAGE_PLANNING">
                <AdminPlanningOverview />
            </RequirePermission>
        </RequireActiveUser>
    }
/>
<Route
    path="/management/planning/events/:eventId"
    element={
        <RequireActiveUser>
            <RequirePermission permission="CAN_MANAGE_PLANNING">
                <AdminPlanningEventDetail />
            </RequirePermission>
        </RequireActiveUser>
    }
/>
<Route
    path="/management/planning/events/:eventId/shifts/:shiftId"
    element={
        <RequireActiveUser>
            <RequirePermission permission="CAN_MANAGE_PLANNING">
                <AdminPlanningShiftDetail />
            </RequirePermission>
        </RequireActiveUser>
    }
/>
<Route
    path="/management/clients"
    element={
        <RequireActiveUser>
            <RequirePermission permission="CAN_MANAGE_PLANNING">
                <AdminPlanningClients />
            </RequirePermission>
        </RequireActiveUser>
    }
/>
```

Wrap the company route:

```tsx
<Route
    path="company"
    element={
        <RequirePermission anyOf={COMPANY_SETTINGS_PERMISSIONS}>
            <SettingsCompany />
        </RequirePermission>
    }
/>
```

Add redirects from old paths:

```tsx
<Route path="/admin/users" element={<Navigate to="/management/users" replace />} />
<Route path="/admin/user/:userId" element={<Navigate to="/management/users/:userId" replace />} />
<Route path="/admin/onboarding" element={<Navigate to="/management/onboarding" replace />} />
<Route path="/admin/payslip-review" element={<Navigate to="/management/payslip-review" replace />} />
<Route path="/admin/payslip/:payslipId" element={<Navigate to="/management/payslips/:payslipId" replace />} />
<Route path="/admin/planning" element={<Navigate to="/management/planning" replace />} />
<Route path="/admin/planning/events/:eventId" element={<Navigate to="/management/planning/events/:eventId" replace />} />
<Route path="/admin/planning/events/:eventId/shifts/:shiftId" element={<Navigate to="/management/planning/events/:eventId/shifts/:shiftId" replace />} />
<Route path="/admin/clients" element={<Navigate to="/management/clients" replace />} />
<Route path="/travel-claims" element={<Navigate to="/management/travel-claims" replace />} />
<Route
    path="/management/travel-claims"
    element={
        <RequireActiveUser>
            <RequirePermission permission="CAN_MANAGE_TIMESHEETS">
                <TravelClaims />
            </RequirePermission>
        </RequireActiveUser>
    }
/>
```

Use real parameter redirect components for routes with params if React Router does not interpolate params inside `Navigate to`. Create local inline components above `App()`:

```tsx
function RedirectAdminUser() {
    const { userId } = useParams();
    return <Navigate to={`/management/users/${userId ?? ""}`} replace />;
}
```

Import `useParams` from `react-router-dom` when using these redirect components.

- [ ] **Step 3: Run build**

Run:

```bash
cd Program/frontend
npm run build
```

Expected: PASS or only failures from route links in pages still pointing to removed paths. If links fail TypeScript, fix the exact reported links by replacing `/admin/` with `/management/`.

- [ ] **Step 4: Run tests**

Run:

```bash
cd Program/frontend
npm test -- src/utils/permissionPolicy.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit route and guard changes**

```bash
git add Program/frontend/src/App.tsx Program/frontend/src/components/RequirePermission.tsx Program/frontend/src/components/RequireAdmin.tsx Program/frontend/src/pages/Management.tsx Program/frontend/src/stylesheets/Management.css
git commit -m "Replace admin route guards with permission management routes"
```

Expected: commit succeeds. `RequireAdmin.tsx` should be deleted in this commit.

---

### Task 7: Make Dashboard Personal-Only

**Files:**
- Modify: `Program/frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Replace Dashboard implementation**

Replace `Program/frontend/src/pages/Dashboard.tsx` with:

```tsx
import UserDashboard from "../components/Dashboards/UserDashboard";
import Navbar from "../components/Navbar";

export default function Dashboard() {
    return (
        <>
            <Navbar />
            <UserDashboard />
        </>
    );
}
```

- [ ] **Step 2: Run build and tests**

Run:

```bash
cd Program/frontend
npm run build
npm test -- src/utils/permissionPolicy.test.ts
```

Expected: both commands PASS.

- [ ] **Step 3: Commit personal dashboard change**

```bash
git add Program/frontend/src/pages/Dashboard.tsx
git commit -m "Make dashboard personal by default"
```

Expected: commit succeeds.

---

### Task 8: Rebuild Primary Navigation Around My Work And Management

**Files:**
- Modify: `Program/frontend/src/components/PrimaryNav.tsx`

- [ ] **Step 1: Remove local permission fetches and admin state**

In `Program/frontend/src/components/PrimaryNav.tsx`, remove:

```tsx
import { AuthServices } from "../services/auth-service/AuthServices";
```

Add:

```tsx
import { useAuth } from "../context/AuthContext";
import { canAccessManagement, canViewPayslips } from "../utils/permissionPolicy";
```

Inside the component, replace the `useState` and `useEffect` permission logic with:

```tsx
const { permissions } = useAuth();
const showManagement = canAccessManagement(permissions);
const showPayslips = canViewPayslips(permissions);
```

- [ ] **Step 2: Replace personal-view URL helpers**

Remove:

```tsx
const personalView = new URLSearchParams(location.search).get("view") === "personal";
const withPersonalView = (target: string) =>
    personalView ? `${target}?view=personal` : target;
```

Use plain route strings such as `"/dashboard"`, `"/my-planning"`, `"/work-history"`, and `"/account"`.

- [ ] **Step 3: Add Management link**

Add a Management link after Dashboard:

```tsx
{showManagement ? (
    <Link
        className={linkClass(path.startsWith("/management"))}
        to="/management"
        aria-current={path.startsWith("/management") ? "page" : undefined}
        aria-label="Management"
        title="Management"
    >
        <svg
            className="nav_quick_icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
        </svg>
        <span className="nav_quick_text">Management</span>
    </Link>
) : null}
```

- [ ] **Step 4: Keep My Work links always personal**

Keep these links visible to active users:

```tsx
<Link className={linkClass(path === "/dashboard")} to="/dashboard">...</Link>
{showPayslips ? <Link className={linkClass(isPayslipsActive)} to="/payslips">...</Link> : null}
<Link className={linkClass(isMyPlanningActive)} to="/my-planning">...</Link>
<Link className={linkClass(isWorkHistoryActive)} to="/work-history">...</Link>
<Link className={linkClass(isAccountActive)} to="/account" state={{ accountReturnTo }}>...</Link>
```

Remove individual management links such as Users, Planning, Clients, Onboarding, and Travel claims from the primary rail; those now live inside `/management`.

- [ ] **Step 5: Run build**

Run:

```bash
cd Program/frontend
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit navigation change**

```bash
git add Program/frontend/src/components/PrimaryNav.tsx
git commit -m "Use permission-based primary navigation"
```

Expected: commit succeeds.

---

### Task 9: Make Navbar Permission-Based

**Files:**
- Modify: `Program/frontend/src/components/Navbar.tsx`

- [ ] **Step 1: Replace admin state with context permissions**

In `Program/frontend/src/components/Navbar.tsx`, remove `AuthServices.isAdmin`, `readCachedIsAdmin`, and `writeCachedIsAdmin` usage.

Add imports:

```tsx
import { canAccessCompanySettings } from "../utils/permissionPolicy";
```

Use the auth context:

```tsx
const { setStatus, permissions, hasPermission } = useAuth();
const canViewUsers = hasPermission("CAN_VIEW_USERS");
const canManageCompany = canAccessCompanySettings(permissions);
```

- [ ] **Step 2: Make user search depend on `CAN_VIEW_USERS`**

Replace:

```tsx
if (!isAdmin || personalView) {
```

with:

```tsx
if (!canViewUsers) {
```

Replace the search render condition:

```tsx
{canViewUsers ? (
```

Update user selection:

```tsx
navigate(`/management/users/${userId}`);
```

- [ ] **Step 3: Remove personal/admin switch menu items**

Delete the menu links for:

```tsx
Personal Account
Admin Dashboard
```

Keep only:

```tsx
<Link
    className="nav_dropdown_item"
    role="menuitem"
    to="/account"
    state={{ accountReturnTo }}
    onClick={() => setMenuOpen(false)}
>
    Account
</Link>
```

- [ ] **Step 4: Update company settings link**

Keep the company dropdown only when `canManageCompany` is true, and set its link to:

```tsx
to="/account/company"
```

- [ ] **Step 5: Run build**

Run:

```bash
cd Program/frontend
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit navbar change**

```bash
git add Program/frontend/src/components/Navbar.tsx
git commit -m "Use permissions for navbar management actions"
```

Expected: commit succeeds.

---

### Task 10: Remove Personal-View Query From Self-Service Pages

**Files:**
- Modify: `Program/frontend/src/pages/Account.tsx`
- Modify: `Program/frontend/src/pages/WorkHistory.tsx`
- Modify: `Program/frontend/src/pages/Payslips.tsx`
- Modify: `Program/frontend/src/pages/MyPlanning.tsx`
- Modify: `Program/frontend/src/pages/MyPlanningShiftDetail.tsx`
- Modify: `Program/frontend/src/pages/WorkHistoryShiftDetail.tsx`

- [ ] **Step 1: Simplify Account routes**

In `Program/frontend/src/pages/Account.tsx`, remove `useNavigate`, `useSearchParams`, `personalView`, and the effect that redirects from `/account/company?view=personal`.

Use fixed route variables:

```tsx
const fallbackBackTo = "/dashboard";
const accountRoot = "/account";
const accountBank = "/account/bank";
const accountEmployment = "/account/employment";
const accountCompany = "/account/company";
const accountCompanyDetails = "/account/company?tab=details";
const accountCompanyRoles = "/account/company?tab=roles";
const accountCompanyWorkflow = "/account/company?tab=workflow";
const accountCompanyTax = "/account/company?tab=tax";
```

- [ ] **Step 2: Simplify WorkHistory scope**

In `Program/frontend/src/pages/WorkHistory.tsx`, remove:

```tsx
const [searchParams] = useSearchParams();
const personalView = searchParams.get("view") === "personal";
```

Set:

```tsx
const showAllTimesheets = canViewAllTimesheets;
```

Change `openShiftDetail` to:

```tsx
const openShiftDetail = (timesheetId: string) => {
    navigate(`/work-history/${timesheetId}`);
};
```

- [ ] **Step 3: Simplify Payslips scope**

In `Program/frontend/src/pages/Payslips.tsx`, remove `personalView` and `withPersonalView`.

Set:

```tsx
const canSwitchScope = canViewOwn && canViewAll;
```

Change `openPayslip` to:

```tsx
const openPayslip = (payslipId: string) => {
    navigate(`/payslips/${payslipId}`);
};
```

Keep `scope=all` query handling for all-company payslip lists.

- [ ] **Step 4: Remove `view=personal` propagation from planning and detail pages**

In `Program/frontend/src/pages/MyPlanning.tsx`, `Program/frontend/src/pages/MyPlanningShiftDetail.tsx`, and `Program/frontend/src/pages/WorkHistoryShiftDetail.tsx`, remove checks for `view=personal` and route builders that append `?view=personal`.

Use plain targets:

```tsx
"/my-planning"
"/dashboard"
"/work-history"
```

- [ ] **Step 5: Search for remaining personal-view logic**

Run:

```bash
cd Program/frontend
Get-ChildItem -Recurse -File src -Include *.tsx,*.ts | Select-String -Pattern "view=personal|personalView|Personal Account|Admin Dashboard"
```

Expected: no results.

- [ ] **Step 6: Run build**

Run:

```bash
cd Program/frontend
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit personal-view removal**

```bash
git add Program/frontend/src/pages/Account.tsx Program/frontend/src/pages/WorkHistory.tsx Program/frontend/src/pages/Payslips.tsx Program/frontend/src/pages/MyPlanning.tsx Program/frontend/src/pages/MyPlanningShiftDetail.tsx Program/frontend/src/pages/WorkHistoryShiftDetail.tsx
git commit -m "Remove personal view query flow"
```

Expected: commit succeeds.

---

### Task 11: Update Management Links Inside Existing Pages

**Files:**
- Modify files reported by the search command in this task.

- [ ] **Step 1: Search for old admin URLs**

Run:

```bash
cd Program/frontend
Get-ChildItem -Recurse -File src -Include *.tsx,*.ts | Select-String -Pattern '"/admin/|`/admin/|to="/admin|navigate\("/admin|navigate\(`/admin'
```

Expected: results in planning, dashboard, payslip, and user-detail pages.

- [ ] **Step 2: Replace old user and onboarding paths**

Use these replacements in the reported files:

```txt
/admin/users -> /management/users
/admin/user/${userId} -> /management/users/${userId}
/admin/onboarding -> /management/onboarding
```

- [ ] **Step 3: Replace old planning paths**

Use these replacements:

```txt
/admin/planning -> /management/planning
/admin/planning/events/${eventId} -> /management/planning/events/${eventId}
/admin/planning/events/${eventId}/shifts/${shiftId} -> /management/planning/events/${eventId}/shifts/${shiftId}
/admin/clients -> /management/clients
```

- [ ] **Step 4: Replace old payslip paths**

Use these replacements:

```txt
/admin/payslip-review -> /management/payslip-review
/admin/payslip/${payslipId} -> /management/payslips/${payslipId}
```

- [ ] **Step 5: Replace user-facing admin labels where visible**

Visible copy should say Management instead of Admin where it describes the app area. For file and component names, keep existing names unless the label appears on screen.

Examples:

```tsx
"Admin Dashboard" -> "Management"
"Review payslip issues" stays unchanged
"Open admin payslip editor" -> "Open payslip management"
```

- [ ] **Step 6: Verify no old links remain**

Run:

```bash
cd Program/frontend
Get-ChildItem -Recurse -File src -Include *.tsx,*.ts | Select-String -Pattern '"/admin/|`/admin/|to="/admin|navigate\("/admin|navigate\(`/admin'
```

Expected: no results except route redirects in `src/App.tsx`.

- [ ] **Step 7: Run build**

Run:

```bash
cd Program/frontend
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit link updates**

```bash
git add Program/frontend/src
git commit -m "Update frontend links to management routes"
```

Expected: commit succeeds and contains only route/link text changes.

---

### Task 12: Make Management Payslip Detail Read-Only Without Manage Permission

**Files:**
- Modify: `Program/frontend/src/pages/AdminPayslipDetails.tsx`

- [ ] **Step 1: Load permission helpers in payslip detail**

In `Program/frontend/src/pages/AdminPayslipDetails.tsx`, import:

```tsx
import { useAuth } from "../context/AuthContext";
```

Inside the component, add:

```tsx
const { hasPermission } = useAuth();
const canManagePayslips = hasPermission("CAN_MANAGE_PAYSLIPS");
```

- [ ] **Step 2: Disable edit fields when the user cannot manage payslips**

For every editable input, textarea, select, add-line button, remove-line button, and save button in `AdminPayslipDetails.tsx`, add:

```tsx
disabled={!canManagePayslips || saving}
```

For remove buttons that do not use `saving`, use:

```tsx
disabled={!canManagePayslips}
```

Render the save action only when management is allowed:

```tsx
{canManagePayslips ? (
    <button className="button" type="button" onClick={() => void handleSave()} disabled={saving}>
        {saving ? "Saving..." : "Save changes"}
    </button>
) : null}
```

- [ ] **Step 3: Add a read-only notice**

Near the page title or top action area, add:

```tsx
{!canManagePayslips ? (
    <p className="helperText">You can view this payslip, but editing requires payslip management permission.</p>
) : null}
```

- [ ] **Step 4: Run build**

Run:

```bash
cd Program/frontend
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit read-only payslip detail**

```bash
git add Program/frontend/src/pages/AdminPayslipDetails.tsx
git commit -m "Gate payslip editing by management permission"
```

Expected: commit succeeds.

---

### Task 13: Replace Component Permission Fetches With AuthContext

**Files:**
- Modify: `Program/frontend/src/pages/SettingsCompany.tsx`
- Modify: `Program/frontend/src/pages/AdminUserDetails.tsx`
- Modify: `Program/frontend/src/pages/WorkHistory.tsx`
- Modify: `Program/frontend/src/pages/Payslips.tsx`

- [ ] **Step 1: Use AuthContext in SettingsCompany**

In `Program/frontend/src/pages/SettingsCompany.tsx`, replace the local permissions state and `AuthServices.getPermissions()` effect with:

```tsx
const { permissions, permissionsLoading, permissionsError } = useAuth();
```

Import:

```tsx
import { useAuth } from "../context/AuthContext";
```

Keep the existing derived booleans:

```tsx
const canCreateRole = permissions.includes("CAN_CREATE_ROLE");
const canAssignRoles = permissions.includes("CAN_ASSIGN_ROLES");
const canRemoveRoles = permissions.includes("CAN_REMOVE_ROLES");
const canEditRoles = permissions.includes("CAN_EDIT_ROLES");
const canDeleteRoles = permissions.includes("CAN_DELETE_ROLES");
const canManageCompany = permissions.includes("CAN_MANAGE_COMPANY");
```

- [ ] **Step 2: Use AuthContext in AdminUserDetails**

In `Program/frontend/src/pages/AdminUserDetails.tsx`, replace local permission state and `AuthServices.getPermissions()` effect with:

```tsx
const { permissions, permissionsLoading, permissionsError, refreshPermissions } = useAuth();
```

After successful role assignment or removal, call:

```tsx
void refreshPermissions();
```

This refreshes the current user's permissions when they changed their own roles.

- [ ] **Step 3: Use AuthContext in WorkHistory**

In `Program/frontend/src/pages/WorkHistory.tsx`, replace local permission state and `AuthServices.getPermissions()` effect with:

```tsx
const { permissions } = useAuth();
```

Remove the `AuthServices` import if it is no longer used.

- [ ] **Step 4: Use AuthContext in Payslips**

In `Program/frontend/src/pages/Payslips.tsx`, replace cached permission state and `AuthServices.getPermissions()` effect with:

```tsx
const { permissions, permissionsLoading, permissionsError } = useAuth();
```

Remove `readCachedPermissions`, `writeCachedPermissions`, and `AuthServices` imports if they are no longer used.

- [ ] **Step 5: Run build and tests**

Run:

```bash
cd Program/frontend
npm run build
npm test -- src/utils/permissionPolicy.test.ts
```

Expected: both commands PASS.

- [ ] **Step 6: Commit shared context adoption**

```bash
git add Program/frontend/src/pages/SettingsCompany.tsx Program/frontend/src/pages/AdminUserDetails.tsx Program/frontend/src/pages/WorkHistory.tsx Program/frontend/src/pages/Payslips.tsx
git commit -m "Use shared auth permissions across pages"
```

Expected: commit succeeds.

---

### Task 14: Remove Remaining `isAdmin` Frontend Usage

**Files:**
- Modify files reported by search.

- [ ] **Step 1: Search for admin checks**

Run:

```bash
cd Program/frontend
Get-ChildItem -Recurse -File src -Include *.tsx,*.ts | Select-String -Pattern "isAdmin|RequireAdmin|CAN_ACCESS_ADMIN_DASHBOARD"
```

Expected: `CAN_ACCESS_ADMIN_DASHBOARD` may remain only in `permissionPolicy.ts`. `isAdmin` and `RequireAdmin` should not remain in frontend components.

- [ ] **Step 2: Replace remaining `isAdmin` usage**

For each remaining frontend use of `AuthServices.isAdmin()` or local `isAdmin`, replace it with permission context:

```tsx
const { hasAnyPermission } = useAuth();
const canUseManagement = hasAnyPermission(MANAGEMENT_PERMISSIONS);
```

or a more specific permission such as:

```tsx
const canViewUsers = hasPermission("CAN_VIEW_USERS");
```

- [ ] **Step 3: Keep auth service method unused or remove export**

If no frontend file calls `AuthServices.isAdmin`, remove the `IsAdmin` import and `isAdmin` property from `Program/frontend/src/services/auth-service/AuthServices.ts`. Leave `Program/frontend/src/services/auth-service/IsAdmin.ts` only if another import still uses it.

Expected `AuthServices.ts` no longer includes:

```ts
import IsAdmin from "./IsAdmin";
isAdmin: async () => {
    return await IsAdmin(API_BASE_URL);
},
```

- [ ] **Step 4: Run build**

Run:

```bash
cd Program/frontend
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit admin-check cleanup**

```bash
git add Program/frontend/src
git commit -m "Remove frontend admin checks"
```

Expected: commit succeeds.

---

### Task 15: Update Rundown For Implemented Frontend Behavior

**Files:**
- Modify: `Project Plan/Rundown/ParadePaardRundown.tex`
- Modify: `Project Plan/Rundown/ParadePaardRundown.pdf`

- [ ] **Step 1: Update role and navigation sections**

In `Project Plan/Rundown/ParadePaardRundown.tex`, update these sections to match the implemented frontend:

```txt
Dashboard Entry
Admin Dashboard
Major User Roles
Login, Password Reset, and Access
Navigation
Final Summary
```

Use this wording as the core replacement for the access model:

```latex
The frontend now uses a permission-based management flow instead of a separate admin flow. The Admin role can still exist, but it is treated as a role preset that contains many permissions. The app decides what a user sees by checking permissions such as \code{CAN_VIEW_USERS}, \code{CAN_ONBOARD_USERS}, \code{CAN_MANAGE_PLANNING}, \code{CAN_MANAGE_TIMESHEETS}, \code{CAN_VIEW_ALL_PAYSLIPS}, \code{CAN_REVIEW_PAYSLIPS}, and \code{CAN_MANAGE_COMPANY}.
```

Use this wording for navigation:

```latex
Navigation is organized around My Work and Management. My Work contains the personal dashboard, My Planning, Work history, Payslips when available, and Account. Management appears only when the user has at least one management permission. Inside Management, each card and route is shown only when the user's permissions allow it.
```

- [ ] **Step 2: Add change-log entry at the top**

Add the newest item at the top of the existing `\section*{Change Log}` list:

```latex
    \item 2026 05 07: Reworked the role-flow documentation after changing the frontend from an admin flow to a permission-based My Work and Management flow.
```

- [ ] **Step 3: Rebuild the PDF twice**

Run:

```bash
cd "Project Plan/Rundown"
pdflatex -interaction=nonstopmode -halt-on-error ParadePaardRundown.tex
pdflatex -interaction=nonstopmode -halt-on-error ParadePaardRundown.tex
Remove-Item -LiteralPath 'ParadePaardRundown.aux','ParadePaardRundown.log','ParadePaardRundown.out' -ErrorAction SilentlyContinue
```

Expected: PDF rebuild succeeds and no `.aux`, `.log`, or `.out` files remain.

- [ ] **Step 4: Verify PDF text**

Run:

```bash
pdftotext -layout "Project Plan/Rundown/ParadePaardRundown.pdf" - | Select-String -Pattern "permission-based management flow|My Work and Management|2026 05 07" -Context 0,2
```

Expected: output includes the new permission-flow wording and change-log entry.

- [ ] **Step 5: Commit rundown update**

```bash
git add "Project Plan/Rundown/ParadePaardRundown.tex" "Project Plan/Rundown/ParadePaardRundown.pdf"
git commit -m "Update rundown for permission role flow"
```

Expected: commit succeeds.

---

### Task 16: Final Verification And Push

**Files:**
- No code edits unless verification exposes a concrete failure.

- [ ] **Step 1: Run frontend tests**

Run:

```bash
cd Program/frontend
npm test
```

Expected: PASS.

- [ ] **Step 2: Run frontend build**

Run:

```bash
cd Program/frontend
npm run build
```

Expected: PASS.

- [ ] **Step 3: Run frontend lint**

Run:

```bash
cd Program/frontend
npm run lint
```

Expected: PASS, or document any pre-existing lint failures with exact file and rule names before committing fixes.

- [ ] **Step 4: Search for old flow leftovers**

Run:

```bash
cd Program/frontend
Get-ChildItem -Recurse -File src -Include *.tsx,*.ts | Select-String -Pattern "RequireAdmin|AuthServices.isAdmin|view=personal|Personal Account|Admin Dashboard"
```

Expected: no results.

- [ ] **Step 5: Check git status**

Run:

```bash
git status
```

Expected: only intended files are modified or staged. Existing unrelated dirty files from before the implementation must not be reverted or swept into commits unless they were intentionally changed for this feature.

- [ ] **Step 6: Push**

Run:

```bash
git push
```

Expected: push succeeds. If remote has moved, run `git fetch origin`, inspect `git log --oneline --left-right --cherry-pick HEAD...origin/main`, rebase with `git rebase --autostash origin/main` when safe, then push again.

---

## Self-Review Result

- Spec coverage: The plan covers the shared permission system, route guards, management dashboard, My Work navigation, removal of personal/admin switch, action-level payslip permissions, rundown update, and verification profiles.
- Placeholder scan: No placeholder tasks are intentionally left open; each task names files, commands, expected results, and concrete code or replacement text.
- Type consistency: Permission helpers use `string` permission names consistently with existing auth service responses. `RequirePermission` accepts `permission`, `anyOf`, and `allOf`, which matches the route examples.
