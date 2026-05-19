# Onboarding Review Page Redesign (Admin)

Date: 2026-05-19

## Goal

Create a dedicated admin-only Onboarding Review page that feels like a focused review form. The admin should be able to:

- Review all submitted onboarding information
- See what is missing and what needs review
- Fill in contract preparation fields (company-side)
- Make a final decision: save review, request changes, create contract draft, or create and send contract

This page must not include general profile content like timesheets, planning, or role management.

## Non-goals

- Replace the normal user profile page (`/management/users/:userId`)
- Persist contract-setup inputs or admin note unless a contract draft is created
- Add planning/timesheet information to onboarding review

## Routing

- Keep the existing review queue: `/management/onboarding-review`
- Add a new dedicated review detail route:
  - `/management/onboarding-review/:userId`

The review queue should navigate to the new review detail page (not the general profile page).

## Page Header

Top area:

- Back button
- Title: `Onboarding Review`
- Subtitle: `Review employee information before creating and sending the contract.`

## Employee Summary Card

A compact summary card near the top showing:

- Full name
- Email
- Phone number
- Position
- Status (badge)
- Registered date

Status badges (display labels):

- Pending review (`PENDING_PROFILE_REVIEW`)
- Needs changes (`CHANGES_REQUESTED`)
- Ready for contract (`PENDING_CONTRACT_SIGNATURE` or `PENDING_CONTRACT_REVIEW` depending on backend meaning)
- Contract sent (derived from current contract state when contract exists)
- Rejected (`REJECTED`)

## Layout (Option B)

- Single-column layout
- On desktop and mobile, the checklist appears above the form sections
- Form sections follow beneath
- Final decision section at the bottom

## Review Checklist

Checklist items and states:

- Personal information
- Address
- Identification
- Bank details
- Emergency contact
- Tax information
- Contract setup

Each item shows one of:

- Complete
- Missing information
- Needs review

If missing:

- Show `Missing:` and list missing fields clearly (e.g. `IBAN`, `Gross hourly wage`, `Start date`)

Checklist logic (initial pass):

- For submitted onboarding data sections (personal/address/id/bank/emergency/tax):
  - `Missing information` if any required field for that section is absent
  - Otherwise `Needs review` (admin still must confirm correctness)
- For `Contract setup`:
  - `Missing information` if any contract required fields are empty
  - Otherwise `Needs review`

## Main Review Sections

Each section is a clean form-style block:

- Clear section title
- Rows with label on left and value on right
- Missing values show a visible warning value: `Missing` or `Required`
- Boolean values show `Yes` / `No`

### 1. Personal information (read-only)

Fields:

- Full name
- Preferred name
- First names
- Middle name prefix
- Last name
- Gender
- Date of birth
- Nationality
- Email
- Mobile

### 2. Address (read-only)

Fields:

- Street
- House number
- House number suffix
- Postal code
- City
- Country

### 3. Identification (read-only)

Fields:

- Document type
- Document number
- Issue date
- Expiration date
- Issuing country
- Uploaded ID document

Uploaded ID document behavior:

- If present: show button `Open ID document`
- If missing: show `Missing ID document`

### 4. Bank details (read-only)

Fields:

- Account holder
- IBAN
- Bank country (if available)

If IBAN is missing, highlight it as a high-importance missing requirement.

### 5. Emergency contact (read-only)

Fields:

- Contact name
- Relationship
- Phone
- Email

### 6. Tax information (read-only)

Replace card-like UI with simple form rows.

Fields:

- BSN
- Apply loonheffingskorting
- Pension participant
- Special employee ZVW contribution
- Payroll notes

### 7. Contract setup (editable)

This section is contract preparation (not an active contract display).

Editable fields:

- Role or function (select when possible)
- Function name (text)
- Contract type
- Start date
- End date
- Gross hourly wage
- Payment frequency
- Travel allowance

Required before sending contract:

- Function name
- Contract type
- Start date
- Gross hourly wage
- Payment frequency

## Final Decision Section

Title: `Final review decision`

Description: `Choose what should happen with this onboarding review.`

Inputs:

- Decision select:
  - Ready to send contract
  - Needs changes
  - Reject onboarding
- Admin note textarea
  - Required for: `Request changes` and `Reject onboarding`

Actions:

- Save review
  - Saves decision + note only (no contract action)
- Request changes
  - Requires admin note
  - Moves user to `CHANGES_REQUESTED`
- Create contract draft
  - Creates a draft contract (no email)
  - Uses Contract setup values
- Create and send contract
  - Creates contract (if needed) and sends email
  - Only enabled if all required fields are complete

Missing-required-fields error message:

- If admin attempts to send while missing fields:
  - `Cannot send contract yet. Please complete the following fields first:`
  - List missing items (e.g. `IBAN`, `Start date`, `Gross hourly wage`)

## Rejection Behavior (Backend)

User requested behavior:

- Rejected users stay in the database
- Rejected users cannot log in
- Users list should show a `Rejected` badge instead of `Active`

Design assumes a new user status:

- `REJECTED`

And auth/login should deny `REJECTED` users.

## Data + Persistence Rules

- Contract setup values and admin note are not persisted by Save review.
- Values persist only when a contract draft is created.

## Accessibility + Responsiveness

- Works on small screens without horizontal scrolling
- Checklist moves/flows naturally (since single-column)
- Buttons remain reachable at the bottom; final decision area uses clear focus states

## Open Questions (Resolved)

- Layout option: Option B (single column)
- Separate page: Yes, dedicated route
- Persistence: Non-persistable until contract draft
- Rejection: Disable login, keep record, show rejected badge
