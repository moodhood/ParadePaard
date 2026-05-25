# Work History Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build separate personal and management work history pages with account-saved management columns and dynamic filters.

**Architecture:** Keep the existing WorkHistory table rendering, but parameterize it by scope. Move reusable filter and column sanitizing behavior into small frontend utilities with focused Vitest coverage. Persist management column choices through a small user-service preference endpoint stored on the user record.

**Tech Stack:** React 19, TypeScript, Vitest, Spring Boot user-service, JPA, Jackson.

---

### Task 1: Frontend Filter And Column Utilities

**Files:**
- Create: `Program/frontend/src/utils/workHistoryFilters.ts`
- Modify: `Program/frontend/src/utils/workHistoryColumns.ts`
- Test: `Program/frontend/src/utils/workHistoryColumns.test.ts`

- [ ] Write failing tests for dynamic filter application and saved column sanitizing.
- [ ] Run `npm test -- workHistoryColumns.test.ts` and confirm the new tests fail because the helpers do not exist.
- [ ] Add the helpers and rerun the same test until it passes.

### Task 2: User Account Preference Endpoint

**Files:**
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/WorkHistoryColumnsPreferenceDTO.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/model/User.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/service/UserService.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/controller/UserController.java`
- Test: `Program/microservice/user-service/src/test/java/com/pm/userservice/UserControllerTest.java`

- [ ] Write failing tests proving the controller exposes current-user preference get/save methods.
- [ ] Run `.\mvnw.cmd -Dtest=UserControllerTest test` in `Program/microservice/user-service` and confirm the new tests fail.
- [ ] Add the DTO, JPA field, service methods, and controller routes.
- [ ] Rerun the same Maven test until it passes.

### Task 3: Frontend Preference Service

**Files:**
- Create: `Program/frontend/src/services/user-service/WorkHistoryPreferences.ts`

- [ ] Add typed get/update functions for `/api/users/me/preferences/work-history-columns`.
- [ ] Use direct imports from WorkHistory to avoid mixing with unrelated local edits in `UserServices.ts`.

### Task 4: Split Work History Pages

**Files:**
- Modify: `Program/frontend/src/pages/WorkHistory.tsx`
- Modify: `Program/frontend/src/pages/WorkHistoryShiftDetail.tsx`
- Modify: `Program/frontend/src/App.tsx`
- Modify: `Program/frontend/src/utils/permissionPolicy.ts`
- Modify: `Program/frontend/src/pages/Management.tsx`
- Modify: `Program/frontend/src/utils/managementSections.ts`
- Modify: `Program/frontend/src/stylesheets/WorkHistory.css`

- [ ] Export `ManagementWorkHistory` beside the default My Work History page.
- [ ] Route `/management/work-history` and `/management/work-history/:timesheetId` behind `CAN_VIEW_ALL_TIMESHEETS`.
- [ ] Add the management navigation card.
- [ ] Show the column chooser only on management Work History and make it scrollable.
- [ ] Replace fixed filters with dynamic filter rows and an Add filter button.
- [ ] Preserve detail-page back navigation based on the current route.

### Task 5: Rundown, Verification, Commit, Push

**Files:**
- Modify: `Project Plan/Rundown/ParadePaardRundown.tex`

- [ ] Update the rundown page descriptions and add the `2026 05 26` change log entry.
- [ ] Run focused frontend and backend tests.
- [ ] Run `npm run build` and record any pre-existing failures.
- [ ] Stage only files changed for this request.
- [ ] Commit with `Split work history pages and update rundown`.
- [ ] Push the commit.
