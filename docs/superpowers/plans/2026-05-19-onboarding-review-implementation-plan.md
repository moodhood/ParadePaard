# Onboarding Review Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated admin “Onboarding Review” detail page that is a focused review form (no planning/timesheets/roles), plus backend support for review decision/note, rejecting onboarding (disable login + badge), and contract creation/send actions.

**Architecture:** Add a new frontend route `/management/onboarding-review/:userId` and a new page component that loads the user and renders a single-column review form (Option B). Add minimal backend support: user-service stores onboarding review decision/note and adds `REJECTED` status; auth-service supports disabling accounts and blocks disabled users at login.

**Tech Stack:** React + TypeScript + Vite (frontend), Spring Boot + JPA (auth-service, user-service), Postgres via Docker compose (`SPRING_JPA_HIBERNATE_DDL_AUTO=update`).

---

## File/Module Map

Frontend:
- Create: `Program/frontend/src/pages/AdminOnboardingReviewDetails.tsx`
- Create: `Program/frontend/src/stylesheets/AdminOnboardingReviewDetails.css`
- Modify: `Program/frontend/src/App.tsx` (add new route)
- Modify: `Program/frontend/src/pages/AdminOnboardingReview.tsx` (queue links to review detail page, rename labels)
- Modify: `Program/frontend/src/pages/AdminUsers.tsx` (render `Rejected` badge correctly)
- Modify: `Program/frontend/src/services/user-service/Types.ts` (add decision/note fields + `REJECTED` status union)
- Create: `Program/frontend/src/services/user-service/UpdateOnboardingReview.ts` (save decision/note and/or status)
- Modify: `Program/frontend/src/services/user-service/UserServices.ts` (export new method)
- Create: `Program/frontend/src/services/auth-service/DisableUser.ts` (disable auth account)
- Create: `Program/frontend/src/services/auth-service/EnableUser.ts` (optional, for future; keep if needed for tests/dev)
- Modify: `Program/frontend/src/services/auth-service/AuthServices.ts` (export disable call)

Backend (user-service):
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/model/UserStatus.java` (add `REJECTED`)
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/model/User.java` (persist review fields)
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/UserResponseDTO.java` (include review fields)
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/mapper/UserMapper.java` (map fields)
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/OnboardingReviewUpdateDTO.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/controller/UserController.java` (new endpoint)
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/service/UserService.java` + impl (apply review update)
- Add tests: `Program/microservice/user-service/src/test/java/...` for endpoint + mapping
- Modify: `Program/microservice/user-service/src/main/resources/data.sql` (include `REJECTED` in seed statuses if applicable)

Backend (auth-service):
- Modify: `Program/microservice/auth-service/src/main/java/com/pm/authservice/model/User.java` (add `disabled` boolean)
- Modify: `Program/microservice/auth-service/src/main/java/com/pm/authservice/service/AuthService.java` (block disabled login)
- Modify: `Program/microservice/auth-service/src/main/java/com/pm/authservice/controller/AuthController.java` (admin enable/disable endpoints)
- Add tests: `Program/microservice/auth-service/src/test/java/...` for login deny + endpoint authz
- Modify: `Program/microservice/auth-service/src/main/resources/data.sql` (default disabled false if seed inserts specify columns)

Docs (required by AGENTS.md when code changes):
- Modify: `Project Plan/Rundown/ParadePaardRundown.tex` (update Onboarding Review page description + Change Log)

---

## Shared Conventions for This Change

- “Onboarding Review” is a dedicated page: do not remove/change the normal profile page at `/management/users/:userId`.
- “Save review” persists only `reviewDecision` + `reviewNote` (and may update `status` to match decision), but does not persist contract draft fields.
- Reject onboarding:
  - Set `user-service` status to `REJECTED`
  - Disable the `auth-service` account so login fails
  - User data remains in the database and should show a `Rejected` badge in admin lists.

---

### Task 1: Add User Review Fields + REJECTED Status (user-service)

**Files:**
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/model/UserStatus.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/model/User.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/UserResponseDTO.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/mapper/UserMapper.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/OnboardingReviewUpdateDTO.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/controller/UserController.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/service/UserService.java` (and impl)
- Test: `Program/microservice/user-service/src/test/java/com/pm/userservice/UserControllerOnboardingReviewTest.java` (new)

- [ ] **Step 1: Add status enum value**

Edit `UserStatus.java`:
```java
public enum UserStatus {
    PENDING_SETUP,
    PENDING_PROFILE_REVIEW,
    CHANGES_REQUESTED,
    PENDING_CONTRACT_SIGNATURE,
    PENDING_CONTRACT_REVIEW,
    ACTIVE,
    REJECTED
}
```

- [ ] **Step 2: Add review fields to User entity**

In `User.java`, add:
```java
@Column(name = "onboarding_review_decision")
private String onboardingReviewDecision;

@Column(name = "onboarding_review_note", length = 2000)
private String onboardingReviewNote;
```
Plus getters/setters.

- [ ] **Step 3: Add fields to UserResponseDTO**

In `UserResponseDTO.java` add:
```java
private String onboardingReviewDecision;
private String onboardingReviewNote;
```
Plus getters/setters.

- [ ] **Step 4: Map fields in UserMapper**

In `UserMapper.toUserResponseDTO(...)` (or equivalent), set:
```java
dto.setOnboardingReviewDecision(user.getOnboardingReviewDecision());
dto.setOnboardingReviewNote(user.getOnboardingReviewNote());
```

- [ ] **Step 5: Create update DTO**

Create `OnboardingReviewUpdateDTO.java`:
```java
package com.pm.userservice.dto;

import jakarta.validation.constraints.NotNull;

public class OnboardingReviewUpdateDTO {
    @NotNull
    private String decision;
    private String note;
    private String status; // optional; used for Request changes / Reject / Ready

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
```

- [ ] **Step 6: Add controller endpoint**

In `UserController.java`, add:
```java
@PutMapping("/{id}/onboarding-review")
@PreAuthorize(\"hasAuthority('CAN_REVIEW_ONBOARDING')\")
public ResponseEntity<UserResponseDTO> updateOnboardingReview(
        @PathVariable UUID id,
        @RequestBody @Validated OnboardingReviewUpdateDTO body,
        Authentication authentication
) {
    UUID companyId = resolveCompanyId(authentication);
    UserResponseDTO updated = userService.updateOnboardingReview(id, companyId, body);
    return ResponseEntity.ok(updated);
}
```

- [ ] **Step 7: Implement service logic**

Add to `UserService` interface:
```java
UserResponseDTO updateOnboardingReview(UUID userId, UUID companyId, OnboardingReviewUpdateDTO body);
```

In service impl:
- Load user by `userId` + `companyId`
- Set `onboardingReviewDecision` to `body.getDecision()`
- Set `onboardingReviewNote` to normalized `body.getNote()` (trim; store null if blank)
- If `body.getStatus()` provided, set `status` to `UserStatus.valueOf(body.getStatus())`
- Save and return updated `UserResponseDTO`

- [ ] **Step 8: Tests**

Create `UserControllerOnboardingReviewTest.java` using `@SpringBootTest` or `@WebMvcTest` (match existing patterns):

Example WebMvc test skeleton:
```java
@WebMvcTest(UserController.class)
class UserControllerOnboardingReviewTest {
  @Autowired MockMvc mvc;
  @MockBean UserService userService;

  @Test
  @WithMockUser(authorities = {\"CAN_REVIEW_ONBOARDING\"})
  void updatesReviewDecisionAndNote() throws Exception {
    UUID id = UUID.randomUUID();
    UUID companyId = UUID.fromString(\"00000000-0000-0000-0000-000000000001\");
    UserResponseDTO response = new UserResponseDTO();
    response.setUserId(id.toString());
    response.setOnboardingReviewDecision(\"READY_TO_SEND_CONTRACT\");
    response.setOnboardingReviewNote(\"Looks good\");
    when(userService.updateOnboardingReview(eq(id), eq(companyId), any())).thenReturn(response);

    mvc.perform(put(\"/users/{id}/onboarding-review\", id)
      .contentType(MediaType.APPLICATION_JSON)
      .content(\"{\\\"decision\\\":\\\"READY_TO_SEND_CONTRACT\\\",\\\"note\\\":\\\"Looks good\\\"}\"))
      .andExpect(status().isOk());
  }
}
```

- [ ] **Step 9: Run tests**

Run:
`cd Program/microservice/user-service`
`./mvnw test`

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add Program/microservice/user-service
git commit -m \"Add onboarding review decision fields\"
git push
```

---

### Task 2: Add Disabled Accounts + Admin Disable Endpoint (auth-service)

**Files:**
- Modify: `Program/microservice/auth-service/src/main/java/com/pm/authservice/model/User.java`
- Modify: `Program/microservice/auth-service/src/main/java/com/pm/authservice/service/AuthService.java`
- Modify: `Program/microservice/auth-service/src/main/java/com/pm/authservice/controller/AuthController.java`
- Test: `Program/microservice/auth-service/src/test/java/com/pm/authservice/AuthDisableUserTest.java` (new)

- [ ] **Step 1: Add disabled flag to auth user**

In `auth-service` `User.java`:
```java
@Column(nullable = false)
@ColumnDefault(\"false\")
private boolean disabled = false;

public boolean isDisabled() { return disabled; }
public void setDisabled(boolean disabled) { this.disabled = disabled; }
```

- [ ] **Step 2: Block disabled users in authenticate()**

In `AuthService.authenticate(...)`, after password check and before issuing tokens:
```java
if (normalizedUser.isDisabled()) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}
```

- [ ] **Step 3: Add admin endpoint to disable/enable users**

In `AuthController.java` add endpoints:
```java
@PutMapping(\"/admin/users/{id}/disable\")
@PreAuthorize(\"hasAuthority('CAN_REVIEW_ONBOARDING') or hasAuthority('CAN_MANAGE_USERS')\")
public ResponseEntity<Void> disableUser(@PathVariable UUID id) {
    authService.setUserDisabled(id, true);
    return ResponseEntity.noContent().build();
}

@PutMapping(\"/admin/users/{id}/enable\")
@PreAuthorize(\"hasAuthority('CAN_MANAGE_USERS')\")
public ResponseEntity<Void> enableUser(@PathVariable UUID id) {
    authService.setUserDisabled(id, false);
    return ResponseEntity.noContent().build();
}
```

Add service method in `AuthService`:
```java
public void setUserDisabled(UUID id, boolean disabled) {
  User user = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
  user.setDisabled(disabled);
  userRepository.save(user);
}
```

- [ ] **Step 4: Tests**

Write a test ensuring disabled users cannot authenticate and disable endpoint requires auth.

Example idea:
- Seed a user, set disabled true, attempt authenticate, expect 401.

- [ ] **Step 5: Run tests**

Run:
`cd Program/microservice/auth-service`
`./mvnw test`

- [ ] **Step 6: Commit**

```bash
git add Program/microservice/auth-service
git commit -m \"Disable rejected users at login\"
git push
```

---

### Task 3: Frontend Service Wrappers for Review Save + Disable User

**Files:**
- Create: `Program/frontend/src/services/user-service/UpdateOnboardingReview.ts`
- Modify: `Program/frontend/src/services/user-service/UserServices.ts`
- Modify: `Program/frontend/src/services/user-service/Types.ts`
- Create: `Program/frontend/src/services/auth-service/DisableUser.ts`
- Modify: `Program/frontend/src/services/auth-service/AuthServices.ts`

- [ ] **Step 1: Add new fields to UserResponseDTO type**

In `Program/frontend/src/services/user-service/Types.ts` update:
```ts
status: ... | \"REJECTED\" | string;
onboardingReviewDecision?: string | null;
onboardingReviewNote?: string | null;
```

- [ ] **Step 2: Add UpdateOnboardingReview client**

Create `UpdateOnboardingReview.ts`:
```ts
import axios from \"axios\";
import type { UserResponseDTO } from \"./Types\";

export type OnboardingReviewUpdateRequest = {
  decision: string;
  note?: string | null;
  status?: string | null;
};

export default async function UpdateOnboardingReview(apiBaseUrl: string, userId: string, payload: OnboardingReviewUpdateRequest): Promise<UserResponseDTO> {
  const res = await axios.put<UserResponseDTO>(`${apiBaseUrl}/api/users/${userId}/onboarding-review`, payload, {
    headers: { \"Content-Type\": \"application/json\" },
    withCredentials: true,
  });
  if (res.status !== 200) throw new Error(\"Failed to save onboarding review: \" + res.status);
  return res.data;
}
```

- [ ] **Step 3: Expose on UserServices**

In `UserServices.ts` import + add:
```ts
updateOnboardingReview: async (userId: string, payload: OnboardingReviewUpdateRequest) => {
  return await UpdateOnboardingReview(API_BASE_URL, userId, payload);
},
```

- [ ] **Step 4: Add disable user client**

Create `DisableUser.ts`:
```ts
import axios from \"axios\";
export default async function DisableUser(apiBaseUrl: string, userId: string): Promise<void> {
  const res = await axios.put(`${apiBaseUrl}/auth/admin/users/${userId}/disable`, null, { withCredentials: true });
  if (res.status !== 204 && res.status !== 200) throw new Error(\"Failed to disable user: \" + res.status);
}
```

Expose in `AuthServices.ts`:
```ts
disableUser: async (userId: string) => await DisableUser(API_BASE_URL, userId),
```

- [ ] **Step 5: Frontend build**

Run:
`cd Program/frontend`
`npm run build`

- [ ] **Step 6: Commit**

```bash
git add Program/frontend/src/services
git commit -m \"Add onboarding review save + disable endpoints\"
git push
```

---

### Task 4: Create Dedicated Onboarding Review Detail Page (Frontend)

**Files:**
- Create: `Program/frontend/src/pages/AdminOnboardingReviewDetails.tsx`
- Create: `Program/frontend/src/stylesheets/AdminOnboardingReviewDetails.css`
- Modify: `Program/frontend/src/App.tsx`
- Modify: `Program/frontend/src/pages/AdminOnboardingReview.tsx`
- Modify: `Program/frontend/src/components/spinnerText.ts` (if needed for path label)

- [ ] **Step 1: Add route**

In `App.tsx` under management routes:
```tsx
<Route
  path=\"/management/onboarding-review/:userId\"
  element={(
    <RequireActiveUser>
      <RequirePermission anyOf={ONBOARDING_REVIEW_PERMISSIONS}>
        <AdminOnboardingReviewDetails />
      </RequirePermission>
    </RequireActiveUser>
  )}
/>
```

- [ ] **Step 2: Update queue navigation**

In `AdminOnboardingReview.tsx` change click + button to navigate to `/management/onboarding-review/${user.userId}` and label “Open review” (not “Open profile”).

- [ ] **Step 3: Implement page structure**

In `AdminOnboardingReviewDetails.tsx`:
- Load user by `userId` param via `UserServices.getUserById`
- Load functions list via existing contract-service helpers (reuse logic from `AdminUserDetails.tsx` as needed, but keep scope small)
- Maintain local state for:
  - reviewDecision (select)
  - reviewNote (textarea)
  - contractDraft fields (editable; NOT persisted unless a contract is created)
- Render sections (single column) in this order:
  1. Header (Back, title, subtitle)
  2. Employee summary card (full name, email, phone, position, status badge, registered date)
  3. Checklist card (items + missing fields list)
  4. Sections: Personal, Address, Identification (Open ID document), Bank (IBAN highlight), Emergency, Tax, Contract setup
  5. Final review decision block with action buttons

Row rendering: label left, value right; missing values show `Missing` with warning styling.
Boolean rendering: `Yes` / `No`.

Checklist rules:
- `Missing information` if section-required fields absent (e.g. ID image missing, IBAN missing)
- otherwise `Needs review` (no auto “Complete” unless you want “Complete” for fully present data; initial spec allows “Needs review” for fully present).

- [ ] **Step 4: Actions**

Implement buttons:
- Save review:
  - calls `UserServices.updateOnboardingReview(userId, { decision, note, status: mappedStatusOrNull })`
  - mapping:
    - Ready to send contract -> set status `PENDING_CONTRACT_SIGNATURE`
    - Needs changes -> set status `CHANGES_REQUESTED` (only if they pick this decision)
    - Reject onboarding -> set status `REJECTED` and require note
- Request changes:
  - require note non-empty
  - call save review with decision `NEEDS_CHANGES`, status `CHANGES_REQUESTED`
- Create contract draft:
  - validate required contract fields (functionName, contractType, startDate, wage, paymentFrequency) AND IBAN presence
  - call contract-service create via `UserServices.createContract(buildContractDraftPayload(...))`
  - after create success, optionally set user status to `PENDING_CONTRACT_SIGNATURE`
- Create and send contract:
  - validate required fields + IBAN
  - create contract if none, then `UserServices.sendContract(contractId)`
  - show success message on completion
- Reject onboarding:
  - call `AuthServices.disableUser(userId)` then `UserServices.updateOnboardingReview(... status REJECTED ...)`
  - after success, show “Rejected” badge

Missing-required-fields error message:
```text
Cannot send contract yet. Please complete the following fields first:
IBAN
Start date
Gross hourly wage
```

- [ ] **Step 5: Styling**

Create `AdminOnboardingReviewDetails.css`:
- Use clean section spacing
- Summary and checklist as compact cards
- Badge styles for statuses
- Missing/required warning color (match existing `cellBad` / `cellWarn` palette)
- Responsive: no sidebars; keep rows wrapping gracefully on small screens.

- [ ] **Step 6: Frontend build**

Run:
`cd Program/frontend`
`npm run build`

- [ ] **Step 7: Commit**

```bash
git add Program/frontend/src/pages Program/frontend/src/stylesheets Program/frontend/src/App.tsx Program/frontend/src/pages/AdminOnboardingReview.tsx
git commit -m \"Add onboarding review detail page\"
git push
```

---

### Task 5: Remove Rejected Users From Login (End-to-End) + Badge in Users List

**Files:**
- Modify: `Program/frontend/src/pages/AdminUsers.tsx`
- Modify: `Program/frontend/src/stylesheets/AdminUsers.css` (if needed)
- Optional: `Program/frontend/src/pages/Login.tsx` messaging (do not leak existence; keep generic)

- [ ] **Step 1: Users list badge**

Ensure `AdminUsers.tsx` (and any user list row rendering) maps `user.status === \"REJECTED\"` to a visible “Rejected” badge.

- [ ] **Step 2: Review queue filtering**

Update `AdminOnboardingReview.tsx` filter set to include `REJECTED` only if you want rejected to be visible in the queue. Recommended: keep queue focused on actionable items and exclude `REJECTED`.

- [ ] **Step 3: Build**

`cd Program/frontend`
`npm run build`

- [ ] **Step 4: Commit**

```bash
git add Program/frontend/src/pages Program/frontend/src/stylesheets
git commit -m \"Show rejected status in admin lists\"
git push
```

---

### Task 6: Update Rundown (AGENTS.md Requirement)

**Files:**
- Modify: `Project Plan/Rundown/ParadePaardRundown.tex`

- [ ] **Step 1: Update Onboarding Review page description**

Update the rundown section for “Management Onboarding Review Page” to describe:
- The queue page
- The new Onboarding Review detail page layout and purpose
- Checklist, summary card, review sections, contract setup section, final decision section
- Explicitly note that timesheets/planning/roles are not part of this page

- [ ] **Step 2: Add Change Log entry (newest at top)**

Add:
`2026 05 19: Redesigned the management onboarding review flow with a dedicated Onboarding Review detail form and checklist.`

- [ ] **Step 3: Commit + push**

```bash
git add \"Project Plan/Rundown/ParadePaardRundown.tex\"
git commit -m \"Redesign onboarding review page and update rundown\"
git push
```

---

### Task 7: End-to-End Verification

- [ ] **Step 1: Rebuild services**

From `Program/microservice`:
`docker compose build auth-service user-service api-gateway`
`docker compose up -d`

- [ ] **Step 2: Smoke test in browser**

Check:
- `/management/onboarding-review` opens queue
- Clicking a user opens `/management/onboarding-review/:userId`
- Checklist renders missing fields correctly
- Save review persists decision/note (reload page confirms)
- Request changes requires note and sets status
- Reject onboarding disables login and sets status `REJECTED`
- Create contract draft creates a DRAFT contract
- Create and send contract sends email and shows success

- [ ] **Step 3: Final commit (if any leftover)**

Ensure `git status` is clean except known unrelated files (do not stage `TODO/TODO.txt`).

---

## Plan Self-Review Checklist

- Spec coverage: route separation, header/summary/checklist sections, contract setup editability, final decision actions, missing-field messaging, rejected disabling.
- Placeholder scan: no TBD/TODO left.
- Type consistency: frontend DTO fields match backend names; endpoints match gateway routes (`/api/users/...` and `/auth/admin/users/...`).

## Execution Choice

Plan complete and saved to `docs/superpowers/plans/2026-05-19-onboarding-review-implementation-plan.md`. Two execution options:

1. Subagent-Driven (recommended) – dispatch a fresh subagent per task, review between tasks.
2. Inline Execution – execute tasks in this session using executing-plans, with checkpoints.

Which approach?
﻿
