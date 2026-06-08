# Platform Super Admin Design

**Date:** 2026-06-07

## Goal

Add a simple first version of a platform-level super admin experience for ParadePaard. This user can onboard new client companies, browse all companies, inspect a company detail view, and enter that company's management area with a visible acting-company banner.

## Scope

This first slice intentionally stays narrow:

- Add a platform admin workspace with two primary entry points:
  - company onboarding
  - companies list
- Add a company detail screen with summary data and a clear `Go to management` action.
- Add an acting-company context in the frontend so the selected company is visible throughout the management UI.
- Add the minimum backend APIs needed to:
  - list companies
  - inspect one company
  - create a new company with its first admin user

This slice does **not** attempt to redesign every company-scoped workflow around true multi-tenant impersonation. It creates a clean platform shell and company-entry flow that the rest of the product can build on.

## Product Model

The super admin uses a hybrid model:

- `Platform mode`
  - global workspace
  - cross-company company directory
  - company onboarding
  - company detail summaries
- `Company mode`
  - entered explicitly from a selected company
  - uses the normal management area
  - shows a persistent banner like `Platform admin mode · Acting in <Company>`
  - includes an `Exit company` action

The super admin keeps their own identity while acting in a company. This is not hidden impersonation.

## Permissions

Introduce a new platform permission:

- `CAN_MANAGE_PLATFORM`

This permission unlocks:

- platform navigation entry
- company onboarding
- company directory
- company detail inspection
- acting-company entry/exit flow

The same account should also carry the normal management permissions so the existing management UI stays available once a company is selected.

## Backend Design

### Platform company APIs

Add company-level endpoints in user-service:

- `GET /api/platform/companies`
  - returns all companies sorted by name
  - includes light summary fields for the platform directory
- `GET /api/platform/companies/{companyId}`
  - returns a richer company detail payload
- `POST /api/platform/companies/onboard`
  - creates a company and its first admin user

### Company onboarding behavior

The onboarding API creates:

- company record
- first admin login
- basic company defaults

The initial form stays deliberately small:

- company name
- admin first name
- admin last name
- admin email
- temporary password

The implementation should reuse the existing auth-service company creation behavior rather than creating companies in two unrelated ways.

### Data returned in company detail

Company detail should include enough information to make the screen useful without overbuilding:

- company id
- company name
- payout frequency
- timesheet logging mode
- travel claim mode
- total employee count
- active employee count
- pending onboarding review count
- company admin count

## Frontend Design

### Platform navigation

Add a `Platform` entry for users with `CAN_MANAGE_PLATFORM`.

The platform landing page should mirror the management page style:

- same shell
- same card language
- same spacing rhythm
- same page width
- same visual hierarchy

Primary cards:

- `Company onboarding`
- `Companies`

### Companies list

The companies screen should present:

- searchable list
- company name
- lightweight company metadata
- `Open details` action

### Company detail

The company detail page should present:

- top summary
- company settings snapshot
- people snapshot
- `Go to management` primary action
- `Back to companies` secondary action

### Acting-company context

When the user chooses `Go to management`:

- store the selected company in frontend context
- route to `/management`
- update top-level UI to show the acting-company state

Visible UI changes in company mode:

- persistent banner above the normal page content
- company switch reflected in the company label used by the navbar
- `Exit company` action clears the acting-company context

## Styling Requirements

This is a frontend UI change, so the implementation must review the whole visible screen, not only the new cards:

- keep widths consistent with management screens
- preserve card spacing and grid balance
- ensure desktop and mobile layouts remain coherent
- keep banner styling strong but integrated with the app
- avoid introducing a one-off visual language

## Error Handling

- platform pages should show inline loading and error states
- onboarding should surface field-level or form-level failure messages
- entering company mode without a valid company should fail safely and stay on the company detail screen
- if acting-company state exists but the company can no longer be loaded, clear the context and notify the user

## Testing

Add tests for:

- permission-based platform nav visibility
- platform routes and card rendering
- company detail acting-company entry
- acting-company banner rendering
- platform company API controller behavior
- onboarding API happy path

## Out of Scope

- hidden impersonation
- full audit-log expansion for platform actions
- cross-service backend impersonation for every microservice
- redesigning every management screen to be tenant-aware beyond the selected-company shell
- advanced onboarding fields like branding, locations, CAO setup, or role templating
