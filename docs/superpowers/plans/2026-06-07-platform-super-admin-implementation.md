# Platform Super Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first platform super admin slice with company onboarding, company directory, company detail, and bannered company-mode entry into management.

**Architecture:** Add a small platform-admin feature layer in the frontend, back it with minimal platform company APIs in user-service, and introduce a frontend acting-company context that integrates with the existing management shell. Reuse existing auth/company creation behavior where possible instead of inventing a second company provisioning path.

**Tech Stack:** React, TypeScript, React Router, Vitest, Spring Boot, Spring Security, JPA

---

## File Structure

### Frontend

- Modify: `Program/frontend/src/App.tsx`
- Modify: `Program/frontend/src/components/Navbar.tsx`
- Modify: `Program/frontend/src/components/PrimaryNav.tsx`
- Modify: `Program/frontend/src/components/Navbar.test.tsx`
- Modify: `Program/frontend/src/pages/Management.test.tsx`
- Modify: `Program/frontend/src/services/user-service/Types.ts`
- Modify: `Program/frontend/src/services/user-service/UserServices.ts`
- Modify: `Program/frontend/src/utils/permissionPolicy.ts`
- Create: `Program/frontend/src/context/PlatformAdminContext.tsx`
- Create: `Program/frontend/src/context/PlatformAdminContext.test.tsx`
- Create: `Program/frontend/src/pages/PlatformAdminHome.tsx`
- Create: `Program/frontend/src/pages/PlatformAdminCompanies.tsx`
- Create: `Program/frontend/src/pages/PlatformAdminCompanyDetails.tsx`
- Create: `Program/frontend/src/pages/PlatformAdminHome.test.tsx`
- Create: `Program/frontend/src/pages/PlatformAdminCompanies.test.tsx`
- Create: `Program/frontend/src/pages/PlatformAdminCompanyDetails.test.tsx`
- Create: `Program/frontend/src/services/user-service/PlatformAdmin.ts`
- Create: `Program/frontend/src/stylesheets/PlatformAdmin.css`

### Backend

- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/integration/AuthServiceClient.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/service/UserService.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/repository/CompanyRepository.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/repository/UserRepository.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/controller/PlatformAdminController.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/PlatformCompanyListItemDTO.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/PlatformCompanyDetailDTO.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/PlatformCompanyOnboardingRequestDTO.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/PlatformCompanyOnboardingResponseDTO.java`
- Create: `Program/microservice/user-service/src/test/java/com/pm/userservice/PlatformAdminControllerTest.java`
- Create: `Program/microservice/user-service/src/test/java/com/pm/userservice/service/PlatformAdminServiceTest.java`

### Docs

- Create: `docs/superpowers/specs/2026-06-07-platform-super-admin-design.md`
- Create: `docs/superpowers/plans/2026-06-07-platform-super-admin-implementation.md`

## Task 1: Add Failing Frontend Navigation and Shell Tests

**Files:**
- Modify: `Program/frontend/src/components/Navbar.test.tsx`
- Modify: `Program/frontend/src/pages/Management.test.tsx`
- Create: `Program/frontend/src/pages/PlatformAdminHome.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
it("renders a Platform entry for platform admins", () => {
    permissions = ["CAN_MANAGE_PLATFORM"];

    const html = renderToStaticMarkup(
        <MemoryRouter>
            <Navbar />
        </MemoryRouter>
    );

    expect(html).toContain("Platform");
});
```

```tsx
it("renders platform entry cards for platform admins", () => {
    const html = renderToStaticMarkup(
        <MemoryRouter>
            <PlatformAdminHome />
        </MemoryRouter>
    );

    expect(html).toContain("Company onboarding");
    expect(html).toContain("Companies");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/components/Navbar.test.tsx src/pages/PlatformAdminHome.test.tsx`

Expected: FAIL because platform routes/components do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add the platform permission constant, route stubs, and a basic platform page component that renders the two entry cards in the existing page shell.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/Navbar.test.tsx src/pages/PlatformAdminHome.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Program/frontend/src/components/Navbar.test.tsx Program/frontend/src/pages/PlatformAdminHome.test.tsx Program/frontend/src/pages/PlatformAdminHome.tsx Program/frontend/src/utils/permissionPolicy.ts Program/frontend/src/App.tsx
git commit -m "feat: add platform admin entry point"
```

## Task 2: Add Failing Acting-Company Context Tests

**Files:**
- Create: `Program/frontend/src/context/PlatformAdminContext.test.tsx`
- Create: `Program/frontend/src/context/PlatformAdminContext.tsx`
- Modify: `Program/frontend/src/components/Navbar.tsx`
- Modify: `Program/frontend/src/components/PrimaryNav.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
it("stores and clears the acting company", () => {
    // render provider, set acting company, assert banner state, clear state
});
```

```tsx
it("renders the acting-company banner when a company is active", () => {
    // render navbar inside provider with an acting company
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/context/PlatformAdminContext.test.tsx src/components/Navbar.test.tsx`

Expected: FAIL because no context/provider or banner exists.

- [ ] **Step 3: Write minimal implementation**

Implement a provider that stores:

```ts
type ActingCompany = {
    companyId: string;
    companyName: string;
};
```

Expose:

```ts
{
    actingCompany,
    startActingAsCompany,
    stopActingAsCompany,
    isPlatformAdmin,
}
```

Render a visible banner in the shared shell when `actingCompany` is set.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/context/PlatformAdminContext.test.tsx src/components/Navbar.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Program/frontend/src/context/PlatformAdminContext.tsx Program/frontend/src/context/PlatformAdminContext.test.tsx Program/frontend/src/components/Navbar.tsx Program/frontend/src/components/PrimaryNav.tsx Program/frontend/src/components/Navbar.test.tsx
git commit -m "feat: add acting company context"
```

## Task 3: Add Failing Platform Company Page Tests

**Files:**
- Create: `Program/frontend/src/pages/PlatformAdminCompanies.test.tsx`
- Create: `Program/frontend/src/pages/PlatformAdminCompanyDetails.test.tsx`
- Create: `Program/frontend/src/services/user-service/PlatformAdmin.ts`
- Modify: `Program/frontend/src/services/user-service/Types.ts`
- Modify: `Program/frontend/src/services/user-service/UserServices.ts`

- [ ] **Step 1: Write the failing tests**

```tsx
it("renders the company list returned by the platform API", async () => {
    // mock platform service listCompanies and assert company rows
});
```

```tsx
it("starts acting as a company from the detail page", async () => {
    // click Go to management and assert navigation/context call
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/pages/PlatformAdminCompanies.test.tsx src/pages/PlatformAdminCompanyDetails.test.tsx`

Expected: FAIL because pages and service do not exist.

- [ ] **Step 3: Write minimal implementation**

Create:

- company directory page
- company detail page
- platform admin service wrappers
- DTO types for company list/detail/onboarding

Use the same card/grid language as the management page.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/pages/PlatformAdminCompanies.test.tsx src/pages/PlatformAdminCompanyDetails.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Program/frontend/src/pages/PlatformAdminCompanies.tsx Program/frontend/src/pages/PlatformAdminCompanies.test.tsx Program/frontend/src/pages/PlatformAdminCompanyDetails.tsx Program/frontend/src/pages/PlatformAdminCompanyDetails.test.tsx Program/frontend/src/services/user-service/PlatformAdmin.ts Program/frontend/src/services/user-service/Types.ts Program/frontend/src/services/user-service/UserServices.ts Program/frontend/src/stylesheets/PlatformAdmin.css
git commit -m "feat: add platform company directory"
```

## Task 4: Add Failing Backend Platform API Tests

**Files:**
- Create: `Program/microservice/user-service/src/test/java/com/pm/userservice/PlatformAdminControllerTest.java`
- Create: `Program/microservice/user-service/src/test/java/com/pm/userservice/service/PlatformAdminServiceTest.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/controller/PlatformAdminController.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/PlatformCompanyListItemDTO.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/PlatformCompanyDetailDTO.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/PlatformCompanyOnboardingRequestDTO.java`
- Create: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/PlatformCompanyOnboardingResponseDTO.java`

- [ ] **Step 1: Write the failing tests**

```java
@Test
void listsCompaniesForPlatformAdmins() throws Exception {
    // mock service and assert 200 payload
}
```

```java
@Test
void onboardsCompanyAndFirstAdmin() {
    // mock auth client + repositories and assert response fields
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `.\mvnw.cmd -Dtest=PlatformAdminControllerTest,PlatformAdminServiceTest test`

Expected: FAIL because controller/service DTOs do not exist.

- [ ] **Step 3: Write minimal implementation**

Add a platform controller under `/api/platform/companies` with:

- list endpoint
- detail endpoint
- onboarding endpoint

Add DTOs and a service path that:

- reads companies from `CompanyRepository`
- derives counts from `UserRepository`
- creates new companies/admins by calling existing auth registration behavior

- [ ] **Step 4: Run tests to verify they pass**

Run: `.\mvnw.cmd -Dtest=PlatformAdminControllerTest,PlatformAdminServiceTest test`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Program/microservice/user-service/src/main/java/com/pm/userservice/controller/PlatformAdminController.java Program/microservice/user-service/src/main/java/com/pm/userservice/dto/PlatformCompanyListItemDTO.java Program/microservice/user-service/src/main/java/com/pm/userservice/dto/PlatformCompanyDetailDTO.java Program/microservice/user-service/src/main/java/com/pm/userservice/dto/PlatformCompanyOnboardingRequestDTO.java Program/microservice/user-service/src/main/java/com/pm/userservice/dto/PlatformCompanyOnboardingResponseDTO.java Program/microservice/user-service/src/test/java/com/pm/userservice/PlatformAdminControllerTest.java Program/microservice/user-service/src/test/java/com/pm/userservice/service/PlatformAdminServiceTest.java Program/microservice/user-service/src/main/java/com/pm/userservice/repository/CompanyRepository.java Program/microservice/user-service/src/main/java/com/pm/userservice/repository/UserRepository.java Program/microservice/user-service/src/main/java/com/pm/userservice/service/UserService.java Program/microservice/user-service/src/main/java/com/pm/userservice/integration/AuthServiceClient.java
git commit -m "feat: add platform company APIs"
```

## Task 5: Wire the End-to-End Flow and Verify UI Consistency

**Files:**
- Modify: `Program/frontend/src/App.tsx`
- Modify: `Program/frontend/src/components/Navbar.tsx`
- Modify: `Program/frontend/src/components/PrimaryNav.tsx`
- Modify: `Program/frontend/src/pages/Management.tsx`
- Modify: `Program/frontend/src/stylesheets/PlatformAdmin.css`
- Modify: `Program/frontend/src/stylesheets/Navbar.css`
- Modify: `Program/frontend/src/stylesheets/PrimaryNav.css`

- [ ] **Step 1: Write the failing integration-oriented tests**

```tsx
it("shows the acting-company banner across management after entering from company detail", () => {
    // render app route flow with provider and assert banner + exit action
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/pages/PlatformAdminCompanyDetails.test.tsx src/pages/Management.test.tsx`

Expected: FAIL until the route flow and shell integration are complete.

- [ ] **Step 3: Write minimal implementation**

Ensure:

- `/platform`
- `/platform/companies`
- `/platform/companies/:companyId`

are wired into the app

Ensure banner/entry/exit behavior works from the real navigation flow and that surrounding layout, spacing, and hierarchy stay consistent with management pages.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/Navbar.test.tsx src/pages/Management.test.tsx src/pages/PlatformAdminHome.test.tsx src/pages/PlatformAdminCompanies.test.tsx src/pages/PlatformAdminCompanyDetails.test.tsx src/context/PlatformAdminContext.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Program/frontend/src/App.tsx Program/frontend/src/components/Navbar.tsx Program/frontend/src/components/PrimaryNav.tsx Program/frontend/src/pages/Management.tsx Program/frontend/src/stylesheets/PlatformAdmin.css Program/frontend/src/stylesheets/Navbar.css Program/frontend/src/stylesheets/PrimaryNav.css
git commit -m "feat: complete platform super admin flow"
```

## Task 6: Full Verification

**Files:**
- Verify all touched files

- [ ] **Step 1: Run frontend test suite for touched areas**

Run: `npm test -- src/components/Navbar.test.tsx src/pages/Management.test.tsx src/pages/PlatformAdminHome.test.tsx src/pages/PlatformAdminCompanies.test.tsx src/pages/PlatformAdminCompanyDetails.test.tsx src/context/PlatformAdminContext.test.tsx`

Expected: PASS

- [ ] **Step 2: Run backend tests for touched user-service areas**

Run: `.\mvnw.cmd -Dtest=PlatformAdminControllerTest,PlatformAdminServiceTest test`

Expected: PASS

- [ ] **Step 3: Run a frontend production build**

Run: `npm run build`

Expected: build completes successfully

- [ ] **Step 4: Review requirements against spec**

Checklist:

- platform home has company onboarding and companies entry points
- companies list exists
- company detail exists
- company detail can enter management
- acting-company banner is visible
- onboarding stays intentionally simple

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add initial platform super admin workspace"
```
