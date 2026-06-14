# Location Client Priorities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Support multiple manual client priorities per saved location and explicit searchable location selection in project and shift forms.

**Architecture:** Extend the existing client-location usage relationship with a manual-priority flag, expose priority client IDs in location DTOs, and synchronize them from location save requests. Reuse one autocomplete component for project and shift forms so searching and selection behavior remains consistent.

**Tech Stack:** Java 21, Spring Boot, JPA, Flyway, React 19, TypeScript, Vitest

---

### Task 1: Persist Multiple Manual Client Priorities

**Files:**
- Create: `Program/microservice/planning-service/src/main/resources/db/migration/V5__add_manual_location_priorities.sql`
- Modify: `Program/microservice/planning-service/src/main/java/com/pm/planningservice/model/PlanningClientLocationUsage.java`
- Modify: `Program/microservice/planning-service/src/main/java/com/pm/planningservice/repository/PlanningClientLocationUsageRepository.java`
- Modify: `Program/microservice/planning-service/src/main/java/com/pm/planningservice/dto/PlanningLocationDTO.java`
- Modify: `Program/microservice/planning-service/src/main/java/com/pm/planningservice/dto/PlanningLocationSaveRequestDTO.java`
- Modify: `Program/microservice/planning-service/src/main/java/com/pm/planningservice/service/PlanningManagementService.java`
- Test: `Program/microservice/planning-service/src/test/java/com/pm/planningservice/service/PlanningManagementServiceTest.java`

- [ ] Add failing service tests proving multiple checked clients are returned and unchecked clients retain last-used history.
- [ ] Run the focused Maven test and confirm it fails on the missing DTO/model API.
- [ ] Add `manually_prioritized`, repository lookup methods, request/response arrays, synchronization, and ranking.
- [ ] Run the planning-service tests.
- [ ] Commit and push the backend slice.

### Task 2: Edit Multiple Priorities In Location Management

**Files:**
- Modify: `Program/frontend/src/services/user-service/GetPlanningLocations.ts`
- Modify: `Program/frontend/src/services/user-service/ManagePlanningLocations.ts`
- Modify: `Program/frontend/src/services/user-service/PlanningLocations.test.ts`
- Modify: `Program/frontend/src/pages/AdminPlanningLocations.tsx`
- Modify: `Program/frontend/src/pages/AdminPlanningLocations.test.tsx`
- Modify: `Program/frontend/src/stylesheets/AdminPlanningLocations.css`

- [ ] Add failing frontend tests for `prioritizedClientCompanyIds` payloads and checkbox-list markup.
- [ ] Run the focused Vitest files and confirm the new assertions fail.
- [ ] Replace the single client field with a checkbox list backed by the ID array.
- [ ] Run focused frontend tests.
- [ ] Commit and push the management UI slice.

### Task 3: Add Explicit Searchable Location Selection

**Files:**
- Modify: `Program/frontend/src/components/planning/PlanningLocationPicker.tsx`
- Create: `Program/frontend/src/components/planning/PlanningLocationPicker.test.tsx`
- Modify: `Program/frontend/src/stylesheets/PlanningLocationPicker.css`

- [ ] Add failing tests for name/address filtering, no implicit selection while typing, mouse selection, and Enter selection.
- [ ] Run the focused component test and confirm the new behavior is absent.
- [ ] Implement an accessible combobox and suggestion list while retaining free-text and add-location support.
- [ ] Run the picker, locations-page, and service tests.
- [ ] Commit and push the autocomplete slice.

### Task 4: Final Verification

**Files:**
- Verify all files changed by Tasks 1-3.

- [ ] Run the full planning-service test suite.
- [ ] Run focused frontend tests and the frontend build, recording any unrelated existing failures.
- [ ] Verify `/management/locations` and a project/shift modal in the browser.
- [ ] Inspect the final diff, push the branch, and report the commits.
