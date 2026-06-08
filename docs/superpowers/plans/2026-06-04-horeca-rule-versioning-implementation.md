# Horeca Rule Versioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move horeca rules and job presets to backend-owned effective-dated storage, create forward replacement contract drafts when published rule versions affect active employees, and wire the horeca admin UI to the new backend.

**Architecture:** User-service becomes the source of truth for horeca rule versions, rule items, and job presets. Contract-service exposes a small replacement-contract operation that clones active finalized contracts forward from an effective date. Frontend stops reading local constants for authoritative data and instead loads and edits the current published backend version, while keeping the existing page layout and modal-heavy interaction model.

**Tech Stack:** Spring Boot, Spring Data JPA, PostgreSQL-compatible schema, React, TypeScript, Vitest, JUnit

---

### Task 1: Add backend horeca rule version storage in user-service

**Files:**
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/model/HorecaRuleSection.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/model/HorecaRuleValueType.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/model/HorecaRuleVersionStatus.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/model/HorecaRuleVersion.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/model/HorecaRuleItem.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/model/HorecaJobPresetConfig.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/repository/HorecaRuleVersionRepository.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/repository/HorecaRuleItemRepository.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/repository/HorecaJobPresetConfigRepository.java`
- Modify: `Program/microservice/user-service/src/main/resources/data.sql`
- Test: `Program/microservice/user-service/src/test/java/com/pm/userservice/service/HorecaRuleServiceTest.java`

- [ ] Step 1: Write the failing repository and service test for loading the current published horeca rule version with seeded sections and job presets.
- [ ] Step 2: Run the user-service test command and verify it fails because the horeca rule model and loader do not exist yet.
- [ ] Step 3: Add the JPA entities, enums, repositories, and seed SQL for the first published horeca rule version, including the new holiday/travel section.
- [ ] Step 4: Add the minimal user-service loader service that returns the current published version with section rows and presets.
- [ ] Step 5: Run the targeted user-service test again and verify it passes.

### Task 2: Add user-service management APIs for current rules and section updates

**Files:**
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/HorecaRuleItemDTO.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/HorecaJobPresetConfigDTO.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/HorecaRuleVersionDTO.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/HorecaRulePublishRequestDTO.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/HorecaRuleSectionUpdateDTO.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/HorecaJobPresetUpdateDTO.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/controller/HorecaRuleAdminController.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/service/HorecaRuleService.java`
- Test: `Program/microservice/user-service/src/test/java/com/pm/userservice/HorecaRuleAdminControllerTest.java`
- Test: `Program/microservice/user-service/src/test/java/com/pm/userservice/service/HorecaRuleServiceTest.java`

- [ ] Step 1: Write the failing controller and service tests for `GET /admin/horeca-rules/current`, `PUT` section updates, `PUT` job presets, and `POST` publish.
- [ ] Step 2: Run the targeted user-service tests and verify they fail for missing controller and publish logic.
- [ ] Step 3: Implement DTOs, controller endpoints, mapping, and the service methods that create or reuse a draft version, save section rows and job presets, and publish a new version with effective dates.
- [ ] Step 4: Add validation that published horeca rule versions cannot overlap and that required source document and page fields are present.
- [ ] Step 5: Run the targeted user-service tests again and verify they pass.

### Task 3: Add forward replacement contract creation in contract-service

**Files:**
- Modify: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/model/Contract.java`
- Modify: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/dto/ContractRequestDTO.java`
- Create: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/dto/RuleReplacementContractRequestDTO.java`
- Create: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/dto/RuleReplacementContractResponseDTO.java`
- Modify: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/service/ContractService.java`
- Modify: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/controller/ContractController.java`
- Modify: `Program/microservice/contract-service/src/main/resources/data.sql`
- Test: `Program/microservice/contract-service/src/test/java/com/pm/contractservice/service/ContractServiceRuleReplacementTest.java`

- [ ] Step 1: Write the failing contract-service test for creating a new draft contract from the latest finalized active contract for an employee when a rule version becomes effective.
- [ ] Step 2: Run the targeted contract-service test and verify it fails because replacement-contract support does not exist.
- [ ] Step 3: Extend the contract model with replacement metadata and implement a service method that clones the active contract forward into a new draft without mutating the old finalized contract.
- [ ] Step 4: Add the minimal secured controller endpoint that user-service can call to create rule-replacement drafts.
- [ ] Step 5: Run the targeted contract-service test again and verify it passes.

### Task 4: Trigger replacement draft creation from user-service publish flow

**Files:**
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/integration/ContractServiceClient.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/service/HorecaRuleService.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/repository/UserRepository.java`
- Test: `Program/microservice/user-service/src/test/java/com/pm/userservice/service/HorecaRuleServiceTest.java`

- [ ] Step 1: Write the failing user-service test for publish flow creating replacement drafts only for affected active employees.
- [ ] Step 2: Run the targeted user-service test and verify it fails because publish does not call contract-service.
- [ ] Step 3: Implement the minimal impact detection mapping for contract-affecting rule fields and wire the publish flow to call contract-service for matching active employees.
- [ ] Step 4: Ensure publish returns a summary of scanned and drafted contracts.
- [ ] Step 5: Run the targeted user-service test again and verify it passes.

### Task 5: Replace frontend local horeca storage with backend services

**Files:**
- Create: `Program/frontend/src/services/user-service/HorecaRules.ts`
- Modify: `Program/frontend/src/services/user-service/Types.ts`
- Modify: `Program/frontend/src/utils/horecaPayrollRules.ts`
- Modify: `Program/frontend/src/utils/horecaPayrollRules.test.ts`
- Test: `Program/frontend/src/services/user-service/HorecaRules.test.ts`

- [ ] Step 1: Write the failing frontend service test for loading current horeca rules and publishing section or preset updates.
- [ ] Step 2: Run the targeted frontend test and verify it fails because the horeca backend service module does not exist.
- [ ] Step 3: Add typed frontend service functions for current-rule load, section save, job preset save, and publish.
- [ ] Step 4: Refactor the horeca utility layer so job presets no longer use local storage and instead operate on backend DTO data.
- [ ] Step 5: Run the targeted frontend service and utility tests again and verify they pass.

### Task 6: Rework the Horeca Payroll Rules page to use backend data and new section popups

**Files:**
- Modify: `Program/frontend/src/pages/HorecaPayrollRules.tsx`
- Modify: `Program/frontend/src/pages/HorecaPayrollRules.test.tsx`
- Modify: `Program/frontend/src/stylesheets/HorecaPayrollRules.css`

- [ ] Step 1: Write the failing page test for rendering edit buttons on wage, tax/payroll, pension, and holiday/travel sections and showing backend-driven values.
- [ ] Step 2: Run the targeted frontend page test and verify it fails because the page still reads constants and lacks the new popup editor.
- [ ] Step 3: Implement backend data loading, section edit buttons, scrollable popups, backend-backed job presets, and the new holiday/travel section while preserving surrounding layout consistency.
- [ ] Step 4: Remove the job preset local reset/save behavior that depends on browser storage and replace it with API-driven state updates.
- [ ] Step 5: Run the targeted page test again and verify it passes.

### Task 7: Move payroll and onboarding consumers toward effective backend values

**Files:**
- Modify: `Program/frontend/src/pages/AdminOnboardingReviewDetails.tsx`
- Modify: `Program/frontend/src/pages/AdminOnboardingReviewDetails.test.tsx`
- Modify: `Program/frontend/src/utils/horecaPayrollRules.ts`
- Modify: `Program/frontend/src/data/horecaPayrollRules.ts`

- [ ] Step 1: Write the failing test for onboarding review and helper logic consuming backend current-rule values for travel allowance and preset-backed defaults.
- [ ] Step 2: Run the targeted frontend tests and verify they fail because those flows still depend on static frontend constants.
- [ ] Step 3: Implement the minimal adapter path so onboarding review and shared horeca helpers prefer backend current-rule data while retaining static fallbacks only where necessary during transition.
- [ ] Step 4: Keep the displayed source labels and page references intact for the updated fields.
- [ ] Step 5: Run the targeted frontend tests again and verify they pass.

### Task 8: End-to-end verification and cleanup

**Files:**
- Modify only as needed based on verification failures

- [ ] Step 1: Run the targeted user-service, contract-service, and frontend test commands for all touched areas.
- [ ] Step 2: Run broader smoke test commands for user-service, contract-service, and frontend if the targeted suite is clean.
- [ ] Step 3: Fix only verified regressions discovered in the smoke pass.
- [ ] Step 4: Re-run the fresh verification commands and record the actual passing evidence before claiming completion.
