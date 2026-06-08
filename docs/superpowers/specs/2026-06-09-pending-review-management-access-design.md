# Pending Review Management Access Design

**Date:** 2026-06-09

## Goal

Let accounts that are waiting on onboarding review, but already have management access, use the existing waiting-state button to open `/management` instead of being trapped in the onboarding flow.

The requested outcome is narrow:

- keep the waiting-for-review onboarding screen
- keep the destination as `/management`
- broaden the access rule so the button and route guards agree
- avoid changing unrelated dashboard, onboarding form, or management page layouts

## Scope

This design covers:

- the waiting-for-review state in [Onboarding.tsx](C:\Saved%20Files\Code\ParadePaard\Program\frontend\src\pages\Onboarding.tsx)
- the active-user route guard in [RequireActiveUser.tsx](C:\Saved%20Files\Code\ParadePaard\Program\frontend\src\components\RequireActiveUser.tsx)
- login and navigation consistency for users in `PENDING_PROFILE_REVIEW`
- targeted tests for the permission/status behavior and waiting-state affordance

This design does **not** cover:

- redesigning the onboarding form
- changing the management page layout or card structure
- changing the destination from `/management` to another route
- widening access for users who still have no management permissions

## Problem Summary

The current UI already renders the requested waiting-state copy and a button that goes to `/management`.

The gap is that the escape rule is narrower than management access:

- [Onboarding.tsx](C:\Saved%20Files\Code\ParadePaard\Program\frontend\src\pages\Onboarding.tsx) shows a "Continue to admin dashboard" button when the user has one of a small `SELF_APPROVAL_PERMISSIONS` values
- [RequireActiveUser.tsx](C:\Saved%20Files\Code\ParadePaard\Program\frontend\src\components\RequireActiveUser.tsx) uses the same narrow permission list to decide whether a `PENDING_PROFILE_REVIEW` user may browse the app
- [permissionPolicy.ts](C:\Saved%20Files\Code\ParadePaard\Program\frontend\src\utils\permissionPolicy.ts) defines a broader management-access concept through `MANAGEMENT_PERMISSIONS` and `canAccessManagement`

That creates a mismatch:

- some users can legitimately access management tools
- but the pending-review bypass only recognizes a subset of those users
- so the UI and guard logic can leave a management-capable account stuck in onboarding

## Options Considered

### 1. Reuse the existing management-access policy everywhere

Treat pending-review users as allowed to leave onboarding when they satisfy the same management-access rule already used elsewhere.

Pros:

- aligns with existing permission policy
- smallest behavioral change
- keeps waiting-state UI intact
- reduces duplicated permission logic

Cons:

- broadens access beyond the original narrow self-approval list

### 2. Expand the local allow-list in onboarding and route guards only

Add more permissions to the current `SELF_APPROVAL_PERMISSIONS` arrays until they roughly match the desired user set.

Pros:

- low code churn at first glance

Cons:

- duplicates policy in multiple files
- easy to drift from actual management access over time
- harder to reason about than one shared rule

### 3. Keep guards as-is and change the waiting button logic only

Only show the button to the currently allowed subset and leave blocked users on onboarding.

Pros:

- smallest visual change

Cons:

- does not solve the reported product problem
- preserves the route/UI mismatch for management-capable users

## Recommended Approach

Use option 1: reuse the broader management-access policy for pending-review bypass behavior.

This matches the clarified requirement that `/management` is the intended destination. It also fits the current product model better than inventing another special-case permission list. If a pending-review account already has management access, the app should consistently let that account reach management from the waiting state.

## Design Rules

### Pending-review management rule

For users in onboarding-related blocked states, `PENDING_PROFILE_REVIEW` is the special case:

- if the user has management access, allow entry into the authenticated management shell
- if the user does not have management access, keep redirecting to `/onboarding`

Other onboarding-blocking states should keep their current behavior unless explicitly required otherwise.

### Waiting-state CTA rule

The waiting-state card should continue to render the review message and include a CTA to `/management` only when the account can actually access management.

This keeps the screen honest:

- no dead-end CTA
- no hidden access path for users without management permissions

### Shared policy rule

Permission checks for this behavior should use the shared management-access helper rather than duplicating a local array of permissions in multiple components.

That keeps the logic centralized and avoids future drift when management permissions evolve.

## Affected Areas

The implementation should inspect and likely touch:

- [Onboarding.tsx](C:\Saved%20Files\Code\ParadePaard\Program\frontend\src\pages\Onboarding.tsx)
- [RequireActiveUser.tsx](C:\Saved%20Files\Code\ParadePaard\Program\frontend\src\components\RequireActiveUser.tsx)
- [Login.tsx](C:\Saved%20Files\Code\ParadePaard\Program\frontend\src\pages\Login.tsx) if route consistency needs adjustment
- onboarding-related tests in [Onboarding.test.ts](C:\Saved%20Files\Code\ParadePaard\Program\frontend\src\pages\Onboarding.test.ts)

The management page itself should be reviewed visually after the change because onboarding users will now arrive there more often from this path.

## Implementation Strategy

1. Replace local narrow self-approval permission logic with the shared management-access helper where the pending-review bypass is decided.
2. Keep the waiting-state CTA destination at `/management`.
3. Ensure the pending-review guard behavior and the waiting-state button use the same predicate.
4. Update tests first to assert the broader management-access rule, then implement the minimum production changes to satisfy them.
5. Recheck the onboarding waiting card and the management landing page together so the end-to-end flow feels intentional.

## UI Review Expectations

Even though this is a narrow flow change, the full visible experience should be checked:

- the onboarding waiting card still reads clearly as a status screen
- the CTA placement and label remain consistent with the rest of the onboarding page
- the management landing page still feels coherent as the destination from this state
- users without management access still see a clear waiting state with no broken navigation affordance
- desktop and mobile layouts for the waiting card remain intact

## Testing And Verification

Add or update tests that cover at least:

- the waiting-state copy still exists
- the waiting-state button still targets `/management`
- the pending-review bypass is based on management access rather than only the old narrow permission list
- users without management access are still redirected to `/onboarding`

Verification should include:

- pending-review user with management permissions can reach `/management`
- pending-review user without management permissions remains on `/onboarding`
- no regression for contract-signing access or active-user navigation

## Risks And Mitigations

### Risk: broadening access too far

If the shared management-access rule includes permissions that should not bypass onboarding, this change could become too permissive.

Mitigation:

- rely on the existing management-access policy rather than inventing new meaning here
- keep the bypass limited to the `PENDING_PROFILE_REVIEW` waiting state described in this request

### Risk: route inconsistency remains in another entry point

If the waiting button uses one rule but login or guards use another, users can still hit loops.

Mitigation:

- update all relevant flow checks to use the same predicate
- verify login, direct route navigation, and in-page CTA behavior

### Risk: visual affordance drifts from real access again

Future permission changes could reintroduce mismatch if local arrays return.

Mitigation:

- remove duplicated permission lists where this flow is decided
- reuse the centralized policy helper

## Implementation Direction

The implementation should be a targeted flow-consistency fix:

- keep the current waiting-state UI
- keep `/management` as the destination
- use shared management access to decide who gets the escape hatch
- update tests first
- verify the onboarding waiting state and management landing page together before completion
