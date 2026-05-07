# Permission-Based Role Flow Design

Date: 2026-05-07

## Purpose

ParadePaard should move away from a separate admin flow. The frontend should use a permission flow instead, where roles are bundles of permissions and one of those roles can be named Admin. The Admin role should no longer create special frontend behavior by itself.

The goal is to make it clear what every signed-in user sees:

- A normal active user sees self-service pages for their own work.
- A user with planning permissions sees planning management.
- A user with payroll permissions sees payroll management.
- A user with company or role permissions sees company settings and access management.
- A user with the Admin role sees a broad management workspace because that role has broad permissions, not because the frontend checks whether they are admin.

## Current Problem

The current frontend mixes two access models.

Some areas are permission-based. Planning routes use `CAN_MANAGE_PLANNING`, travel claims use `CAN_MANAGE_TIMESHEETS`, work history can switch to all-timesheet scope with `CAN_VIEW_ALL_TIMESHEETS`, and payslips can switch between personal and all-company scopes with payslip permissions.

Other areas are still admin-gated. User administration, employee onboarding, payslip review, admin payslip editing, the admin dashboard, and navbar user search depend on `isAdmin` or `RequireAdmin`. This creates unclear behavior for non-admin users who have a specific management role. They may have the backend permission for a workflow but not see the matching frontend route, dashboard, or navigation.

## Access Model

The frontend should stop asking whether the user is admin for layout, routing, dashboards, and navigation. It should load the active user's permissions and derive the visible experience from that permission set.

The frontend should use these derived states:

- **Active employee:** signed in with `ACTIVE` status. This user sees the self-service app.
- **Pending setup user:** signed in with `PENDING_SETUP` status. This user sees onboarding until setup is complete.
- **Management-capable user:** active user with at least one management permission. This user sees the Management area.
- **Admin role user:** a user assigned to a broad role named Admin. This is just a role preset and should not be a special frontend branch.

The question should become "which permissions does this user have?" instead of "is this user admin?"

## Navigation Model

The app should have two clear navigation groups.

### My Work

My Work is the personal employee-facing area. It is available to active users and shows the user's own information and workflows.

It should include:

- Dashboard
- My planning
- Work history
- Payslips, when the user has `CAN_VIEW_PAYSLIPS` or `CAN_VIEW_ALL_PAYSLIPS`
- Account

### Management

Management appears only when the user has at least one management permission. It is not admin mode. It is an operational workspace that shows only the pages the user can actually use.

It should include:

- Users, when the user has `CAN_VIEW_USERS`
- Onboarding, when the user has `CAN_ONBOARD_USERS`
- Planning, when the user has `CAN_MANAGE_PLANNING`
- Clients, when the user has `CAN_MANAGE_PLANNING`
- Travel claims, when the user has `CAN_MANAGE_TIMESHEETS`
- All work history scope, when the user has `CAN_VIEW_ALL_TIMESHEETS`
- All payslips scope, when the user has `CAN_VIEW_ALL_PAYSLIPS`
- Payslip review, when the user has `CAN_REVIEW_PAYSLIPS`
- Company settings, when the user has `CAN_MANAGE_COMPANY` or role-management permissions

The current `?view=personal` mode should be removed. A user with management permissions does not need to switch identity. They simply have both My Work and Management.

## Dashboard Model

The dashboard should stop switching between an admin dashboard and a user dashboard.

The recommended model is:

- `/dashboard` shows the personal dashboard.
- `/management` shows a permission-based management dashboard.

The management dashboard should be assembled from cards. Each card should have its own permission requirement.

Examples:

- Planning cards require `CAN_MANAGE_PLANNING`.
- People cards require `CAN_VIEW_USERS` or `CAN_ONBOARD_USERS`.
- Timesheet and travel cards require `CAN_VIEW_ALL_TIMESHEETS` or `CAN_MANAGE_TIMESHEETS`.
- Payroll cards require `CAN_VIEW_ALL_PAYSLIPS`, `CAN_REVIEW_PAYSLIPS`, or `CAN_MANAGE_PAYSLIPS`.
- Company cards require `CAN_MANAGE_COMPANY` or role-management permissions.

A planner should see planning cards. A payroll reviewer should see payroll cards. A user with the Admin role should see a broad management dashboard because that role has broad permissions.

## Route Permissions

Routes should be guarded by permissions that match what the page actually does.

Suggested route structure:

- `/dashboard`: active user only.
- `/management`: active user plus any management permission.
- `/management/users`: `CAN_VIEW_USERS`.
- `/management/users/:userId`: `CAN_VIEW_USERS`.
- `/management/onboarding`: `CAN_ONBOARD_USERS`.
- `/management/planning`: `CAN_MANAGE_PLANNING`.
- `/management/planning/events/:eventId`: `CAN_MANAGE_PLANNING`.
- `/management/planning/events/:eventId/shifts/:shiftId`: `CAN_MANAGE_PLANNING`.
- `/management/clients`: `CAN_MANAGE_PLANNING`.
- `/management/travel-claims`: `CAN_MANAGE_TIMESHEETS`.
- `/management/payslip-review`: `CAN_REVIEW_PAYSLIPS`.
- `/management/payslips/:payslipId`: `CAN_VIEW_ALL_PAYSLIPS` to open a company payslip, with edit controls shown only when the user also has `CAN_MANAGE_PAYSLIPS`.
- `/account/company`: `CAN_MANAGE_COMPANY` or role-management permissions.

Self-service routes stay separate:

- `/my-planning`: active user.
- `/work-history`: active user. The page can show own or all-company scope based on `CAN_VIEW_ALL_TIMESHEETS`.
- `/payslips`: active user with `CAN_VIEW_PAYSLIPS` or `CAN_VIEW_ALL_PAYSLIPS`.
- `/payslips/:payslipId`: frontend shows the employee detail view; backend ownership and all-payslip permissions enforce actual access.

Route access and page actions should not always use the same permission. A user may be allowed to open a page but not edit everything on it.

Examples:

- `CAN_VIEW_USERS` opens user lists and user detail pages.
- `CAN_MANAGE_USERS` unlocks user editing, payroll tax profile saving, and destructive user actions.
- `CAN_ASSIGN_ROLES` unlocks adding roles.
- `CAN_REMOVE_ROLES` unlocks removing roles.
- `CAN_VIEW_ALL_PAYSLIPS` opens all-company payslip lists.
- `CAN_REVIEW_PAYSLIPS` opens the review queue.
- `CAN_MANAGE_PAYSLIPS` unlocks editing payslip values and statuses.

## Shared Permission System

The frontend should have one shared permission source.

Recommended implementation shape:

- Extend `AuthContext` so it exposes `status`, `permissions`, `permissionsLoading`, `permissionsError`, `hasPermission()`, and `hasAnyPermission()`.
- Fetch permissions once after authentication and refresh them when roles or login state change.
- Keep permission caching in one place.
- Replace `RequireAdmin` with permission guards.
- Extend `RequirePermission` so it can accept one permission or any-of-many permissions.
- Read permissions from context in `PrimaryNav`, `Navbar`, dashboards, account settings, payslips, work history, and management pages.
- Treat `/auth/is-admin` as legacy once the frontend no longer needs it.

This keeps navigation, routes, dashboards, and action buttons aligned with the same permission state.

## Migration Plan

The implementation should be incremental.

1. Add central permission state and helper checks to the auth layer.
2. Replace admin route guards with permission guards.
3. Add the `/management` route and permission-based management dashboard.
4. Move admin route paths toward management route paths, while keeping redirects from old admin paths during transition.
5. Update primary navigation into My Work and Management groups.
6. Remove `?view=personal` and the admin/personal switch.
7. Make dashboard cards and page actions permission-aware.
8. Remove old admin-specific frontend helpers once no component depends on them.
9. Update the rundown after implementation to describe the actual new frontend flow.

## Test Expectations

The finished implementation should be tested with these user profiles:

- Plain employee: sees only My Work pages and personal account workflows.
- Planner: sees My Work plus Planning and Clients in Management.
- Timesheet manager: sees My Work plus all work history scope and Travel Claims.
- Payroll reviewer: sees My Work plus payslip review and all-payslip views allowed by their permissions.
- Company or role manager: sees company settings and access-management tools.
- Admin role user: sees the broad management workspace because the Admin role includes broad permissions.
- Pending setup user: always goes to onboarding and does not enter My Work or Management until active.

## Out Of Scope

This design does not implement the changes yet. It also does not change backend authorization rules unless a later implementation step finds a mismatch between frontend pages and backend permission annotations.
