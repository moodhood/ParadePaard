# Contract-Owned Payroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make contracts own payroll frequency, expose employee contract access, add signing/finalization workflow states, and stop generating released payslips from user-level frequency settings.

**Architecture:** Contract service becomes the source for payment frequency, contract status, and payroll-active contract checks. Payroll service asks contract service for the active finalized contract and stores a contract snapshot on each payslip. The frontend shows contract status and payment frequency in account/employment UI while the permission catalog gains explicit own-contract, onboarding-review, and contract-review permissions.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Java 21, Spring Boot 3.5, Spring Security, JPA, gRPC/protobuf, Maven.

---

## Scope Split

This plan implements the first working vertical slice from the approved design:

- Contract-owned payment frequency.
- Contract status transitions for sent, employee-signed, finalized, rejected, and expired states.
- Employee access to own contracts and signing actions.
- Management permissions for onboarding review, contract review, contract finalization, and all-contract visibility.
- Payroll scheduler no longer uses `payslipFrequencyMinutes` as the production rule.
- Zero-pay periods are skipped or reviewed according to contract type.
- Account Employment shows current contract, contract history, status, payment frequency, and signing/download actions.

This plan does not include binary document storage for CV and ID uploads. That should be planned separately because it needs storage, retention, privacy, and file-preview decisions.

## File Structure

### Auth Service

- Modify `Program/microservice/auth-service/src/main/java/com/pm/authservice/service/AuthService.java`
  Add new default permissions to admin and employee roles.
- Modify `Program/microservice/auth-service/src/main/resources/data.sql`
  Seed new permissions and add them to the default role presets.

### User Service

- Modify `Program/microservice/user-service/src/main/java/com/pm/userservice/model/UserStatus.java`
  Add onboarding workflow statuses.
- Modify `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/AdminOnboardingRequestDTO.java`
  Accept contract payment frequency from management onboarding.
- Modify `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/ContractDraftRequestDTO.java`
  Forward payment frequency to contract service.
- Modify `Program/microservice/user-service/src/main/java/com/pm/userservice/service/OnboardingService.java`
  Stop finalizing contracts automatically when the employee completes setup.

### Contract Service

- Create `Program/microservice/contract-service/src/main/java/com/pm/contractservice/model/PaymentFrequency.java`
  Normalize supported payroll frequencies and hide five-minute frequency from production.
- Modify `Program/microservice/contract-service/src/main/java/com/pm/contractservice/model/ContractStatus.java`
  Add workflow states while keeping legacy `SIGNED` readable.
- Modify `Program/microservice/contract-service/src/main/java/com/pm/contractservice/model/Contract.java`
  Store payment frequency as a typed enum and add workflow review fields.
- Create `Program/microservice/contract-service/src/main/java/com/pm/contractservice/dto/ContractReviewRequestDTO.java`
  Carry required comments for rejection or requested-change actions.
- Modify `Program/microservice/contract-service/src/main/java/com/pm/contractservice/dto/ContractRequestDTO.java`
  Validate and accept payment frequency.
- Modify `Program/microservice/contract-service/src/main/java/com/pm/contractservice/dto/ContractResponseDTO.java`
  Return payment frequency, employee signature timestamp, finalization timestamp, and review comment.
- Modify `Program/microservice/contract-service/src/main/java/com/pm/contractservice/mapper/ContractMapper.java`
  Map payment frequency and workflow fields.
- Modify `Program/microservice/contract-service/src/main/java/com/pm/contractservice/repository/ContractRepository.java`
  Find only payroll-active contracts for payroll generation.
- Modify `Program/microservice/contract-service/src/main/java/com/pm/contractservice/service/ContractService.java`
  Add send, sign, reject, and finalize workflow methods.
- Modify `Program/microservice/contract-service/src/main/java/com/pm/contractservice/controller/ContractController.java`
  Add workflow endpoints and tighten permissions.
- Modify `Program/microservice/contract-service/src/main/java/com/pm/contractservice/grpc/ContractGrpcService.java`
  Return only finalized payroll-active contracts through gRPC.
- Modify `Program/microservice/contract-service/src/main/java/com/pm/contractservice/service/pdf/ContractPdfGenerator.java`
  Render payment frequency and workflow-safe contract status.
- Modify `Program/microservice/contract-service/src/main/proto/contract_service.proto`
  Keep `paymentFrequency` and add `contractId`, `status`, `weeklyHours`, and contract date fields as stable payroll snapshot data.

### Payroll Service

- Create `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/service/PayPeriod.java`
  Value object for period start, period end, issue date, and idempotency key.
- Create `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/service/PayPeriodCalculator.java`
  Convert contract payment frequency into the due pay period.
- Modify `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/model/Payslip.java`
  Store contract snapshot fields.
- Modify `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/dto/PayslipResponseDTO.java`
  Return contract snapshot fields and review reasons to the frontend.
- Modify `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/mapper/PayslipMapper.java`
  Copy contract snapshot values into payslip DTOs.
- Modify `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/service/PayrollService.java`
  Add contract-owned scheduled payslip generation and zero-hour rules.
- Modify `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/scheduler/PayslipScheduler.java`
  Stop using `userRow.payslipFrequencyMinutes()` as the payroll frequency source.
- Modify `Program/microservice/payroll-service/src/main/proto/contract_service.proto`
  Match contract-service proto.

### Frontend

- Modify `Program/frontend/src/services/user-service/GetContracts.ts`
  Add typed contract status, payment frequency labels, and sign/send/finalize/reject client calls.
- Modify `Program/frontend/src/services/user-service/UserServices.ts`
  Export new contract workflow service functions.
- Modify `Program/frontend/src/services/user-service/Types.ts`
  Add onboarding payment frequency to `AdminOnboardingRequestDTO`.
- Modify `Program/frontend/src/pages/AdminOnboarding.tsx`
  Add payment-frequency field with production-safe options.
- Modify `Program/frontend/src/pages/AccountEmploymentDetails.tsx`
  Show contract status/history/payment frequency and employee sign action.
- Modify `Program/frontend/src/pages/AdminUserDetails.tsx`
  Show current contract status, payment frequency, and review action links.
- Modify `Program/frontend/src/utils/permissionPolicy.ts`
  Add contract permissions to management access rules.
- Modify `Program/frontend/src/utils/permissionSections.ts`
  Group contract and onboarding review permissions in role modals.
- Modify `Program/frontend/src/utils/permissionPolicy.test.ts`
  Cover management access from new contract review permissions.
- Modify `Program/frontend/src/utils/permissionSections.test.ts`
  Cover permission grouping labels.

### Documentation

- Modify `Project Plan/Rundown/ParadePaardRundown.tex`
  Add change-log entry and update relevant Account, Onboarding, Company Settings, Payslips, and Management User Detail descriptions after frontend implementation.

---

## Task 1: Permissions Foundation

**Files:**
- Modify: `Program/microservice/auth-service/src/main/java/com/pm/authservice/service/AuthService.java`
- Modify: `Program/microservice/auth-service/src/main/resources/data.sql`
- Modify: `Program/frontend/src/utils/permissionPolicy.ts`
- Modify: `Program/frontend/src/utils/permissionSections.ts`
- Test: `Program/frontend/src/utils/permissionPolicy.test.ts`
- Test: `Program/frontend/src/utils/permissionSections.test.ts`

- [ ] **Step 1: Write frontend permission tests**

In `Program/frontend/src/utils/permissionPolicy.test.ts`, add these assertions:

```ts
it("treats contract review permissions as management access", () => {
    expect(canAccessManagement(["CAN_VIEW_ONBOARDING_QUEUE"])).toBe(true);
    expect(canAccessManagement(["CAN_REVIEW_ONBOARDING"])).toBe(true);
    expect(canAccessManagement(["CAN_VIEW_ALL_CONTRACTS"])).toBe(true);
    expect(canAccessManagement(["CAN_REVIEW_CONTRACTS"])).toBe(true);
    expect(canAccessManagement(["CAN_FINALIZE_CONTRACT"])).toBe(true);
});

it("keeps own-contract permissions out of management access", () => {
    expect(canAccessManagement(["CAN_VIEW_OWN_CONTRACTS"])).toBe(false);
    expect(canAccessManagement(["CAN_SIGN_OWN_CONTRACTS"])).toBe(false);
});
```

In `Program/frontend/src/utils/permissionSections.test.ts`, add:

```ts
it("groups onboarding and contract permissions", () => {
    const sections = buildPermissionSections([
        "CAN_VIEW_ONBOARDING_QUEUE",
        "CAN_REVIEW_ONBOARDING",
        "CAN_VIEW_ALL_CONTRACTS",
        "CAN_MANAGE_CONTRACTS",
        "CAN_REVIEW_CONTRACTS",
        "CAN_FINALIZE_CONTRACT",
        "CAN_VIEW_OWN_CONTRACTS",
        "CAN_SIGN_OWN_CONTRACTS",
    ]);

    expect(sections.map((section) => section.title)).toEqual(["People", "Contracts", "Self service"]);
    expect(sections[1]?.permissions).toEqual([
        "CAN_FINALIZE_CONTRACT",
        "CAN_MANAGE_CONTRACTS",
        "CAN_REVIEW_CONTRACTS",
        "CAN_VIEW_ALL_CONTRACTS",
    ]);
});
```

- [ ] **Step 2: Run frontend tests and verify they fail**

Run:

```powershell
cd Program/frontend
npm test -- permissionPolicy permissionSections
```

Expected: tests fail because contract permissions are not grouped or treated as management permissions yet.

- [ ] **Step 3: Update frontend permission policy**

In `Program/frontend/src/utils/permissionPolicy.ts`, add contract permission constants and include management permissions:

```ts
export const CONTRACT_MANAGEMENT_PERMISSIONS = [
    "CAN_VIEW_ONBOARDING_QUEUE",
    "CAN_REVIEW_ONBOARDING",
    "CAN_VIEW_ALL_CONTRACTS",
    "CAN_MANAGE_CONTRACTS",
    "CAN_REVIEW_CONTRACTS",
    "CAN_FINALIZE_CONTRACT",
];

export const OWN_CONTRACT_PERMISSIONS = [
    "CAN_VIEW_OWN_CONTRACTS",
    "CAN_SIGN_OWN_CONTRACTS",
];
```

Then include contract management permissions in `MANAGEMENT_PERMISSIONS`:

```ts
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
    ...CONTRACT_MANAGEMENT_PERMISSIONS,
    ...ROLE_MANAGEMENT_PERMISSIONS,
];
```

Add contract management cards to `MANAGEMENT_NAV_ITEMS`:

```ts
{ label: "Onboarding review", to: "/management/onboarding", permissions: ["CAN_VIEW_ONBOARDING_QUEUE", "CAN_REVIEW_ONBOARDING"] },
{ label: "Contracts", to: "/management/users", permissions: ["CAN_VIEW_ALL_CONTRACTS", "CAN_REVIEW_CONTRACTS", "CAN_FINALIZE_CONTRACT"] },
```

- [ ] **Step 4: Update permission grouping**

In `Program/frontend/src/utils/permissionSections.ts`, extend labels:

```ts
CAN_VIEW_OWN_CONTRACTS: "View own contracts",
CAN_SIGN_OWN_CONTRACTS: "Sign own contracts",
CAN_VIEW_ONBOARDING_QUEUE: "View onboarding queue",
CAN_REVIEW_ONBOARDING: "Review onboarding",
CAN_VIEW_ALL_CONTRACTS: "View all contracts",
CAN_MANAGE_CONTRACTS: "Manage contracts",
CAN_REVIEW_CONTRACTS: "Review signed contracts",
CAN_FINALIZE_CONTRACT: "Finalize contracts",
```

Add sections:

```ts
{
    title: "Contracts",
    permissions: [
        "CAN_VIEW_ALL_CONTRACTS",
        "CAN_MANAGE_CONTRACTS",
        "CAN_REVIEW_CONTRACTS",
        "CAN_FINALIZE_CONTRACT",
    ],
},
{
    title: "Self service",
    permissions: ["CAN_VIEW_OWN_CONTRACTS", "CAN_SIGN_OWN_CONTRACTS"],
},
```

Change the People section to:

```ts
{
    title: "People",
    permissions: [
        "CAN_VIEW_USERS",
        "CAN_MANAGE_USERS",
        "CAN_ONBOARD_USERS",
        "CAN_VIEW_ONBOARDING_QUEUE",
        "CAN_REVIEW_ONBOARDING",
    ],
},
```

- [ ] **Step 5: Seed backend permissions**

In `Program/microservice/auth-service/src/main/java/com/pm/authservice/service/AuthService.java`, update `DEFAULT_ADMIN_PERMISSIONS`:

```java
"CAN_VIEW_ONBOARDING_QUEUE",
"CAN_REVIEW_ONBOARDING",
"CAN_VIEW_OWN_CONTRACTS",
"CAN_SIGN_OWN_CONTRACTS",
"CAN_VIEW_ALL_CONTRACTS",
"CAN_MANAGE_CONTRACTS",
"CAN_REVIEW_CONTRACTS",
"CAN_FINALIZE_CONTRACT",
```

Update `DEFAULT_USER_PERMISSIONS`:

```java
"CAN_COMPLETE_ONBOARDING",
"CAN_VIEW_OWN_CONTRACTS",
"CAN_SIGN_OWN_CONTRACTS",
"CAN_VIEW_PAYSLIPS",
"CAN_REPORT_PAYSLIP_ERRORS",
"CAN_VIEW_OWN_TIMESHEETS"
```

In `Program/microservice/auth-service/src/main/resources/data.sql`, add `SELECT gen_random_uuid()` inserts for the same permissions and include them in the default admin/user role permission seed blocks.

- [ ] **Step 6: Run frontend permission tests**

Run:

```powershell
cd Program/frontend
npm test -- permissionPolicy permissionSections
```

Expected: tests pass.

- [ ] **Step 7: Commit permissions foundation**

```powershell
git add Program/frontend/src/utils/permissionPolicy.ts Program/frontend/src/utils/permissionPolicy.test.ts Program/frontend/src/utils/permissionSections.ts Program/frontend/src/utils/permissionSections.test.ts Program/microservice/auth-service/src/main/java/com/pm/authservice/service/AuthService.java Program/microservice/auth-service/src/main/resources/data.sql
git commit -m "Add contract workflow permissions"
```

---

## Task 2: Contract Workflow Model And Endpoints

**Files:**
- Create: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/model/PaymentFrequency.java`
- Create: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/dto/ContractReviewRequestDTO.java`
- Modify: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/model/ContractStatus.java`
- Modify: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/model/Contract.java`
- Modify: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/dto/ContractRequestDTO.java`
- Modify: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/dto/ContractResponseDTO.java`
- Modify: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/mapper/ContractMapper.java`
- Modify: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/repository/ContractRepository.java`
- Modify: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/service/ContractService.java`
- Modify: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/controller/ContractController.java`
- Test: `Program/microservice/contract-service/src/test/java/com/pm/contractservice/service/ContractWorkflowTest.java`

- [ ] **Step 1: Add failing contract workflow test**

Create `Program/microservice/contract-service/src/test/java/com/pm/contractservice/service/ContractWorkflowTest.java`:

```java
package com.pm.contractservice.service;

import com.pm.contractservice.model.Contract;
import com.pm.contractservice.model.ContractStatus;
import com.pm.contractservice.model.ContractType;
import com.pm.contractservice.model.PaymentFrequency;
import com.pm.contractservice.repository.ContractRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ContractWorkflowTest {
    @Autowired
    private ContractRepository contractRepository;

    @Test
    void finalizedContractIsPayrollActiveButEmployeeSignedContractIsNot() {
        UUID userId = UUID.randomUUID();

        Contract employeeSigned = contract(userId, ContractStatus.EMPLOYEE_SIGNED, LocalDate.of(2026, 5, 1));
        Contract finalized = contract(userId, ContractStatus.FINALIZED, LocalDate.of(2026, 5, 10));
        contractRepository.save(employeeSigned);
        contractRepository.save(finalized);

        var active = contractRepository.findPayrollActiveForPeriod(
                userId,
                LocalDate.of(2026, 5, 12),
                LocalDate.of(2026, 5, 12)
        );

        assertThat(active).hasSize(1);
        assertThat(active.getFirst().getStatus()).isEqualTo(ContractStatus.FINALIZED);
    }

    private static Contract contract(UUID userId, ContractStatus status, LocalDate startDate) {
        Contract contract = new Contract();
        contract.setUserId(userId);
        contract.setStartDate(startDate);
        contract.setContractType(ContractType.ON_CALL_RUNNER);
        contract.setStatus(status);
        contract.setGrossHourlyWage(new BigDecimal("18.50"));
        contract.setTravelAllowance(Boolean.TRUE);
        contract.setPaymentFrequency(PaymentFrequency.WEEKLY);
        return contract;
    }
}
```

- [ ] **Step 2: Run contract-service test and verify it fails**

Run:

```powershell
cd Program/microservice/contract-service
mvn -Dtest=ContractWorkflowTest test
```

Expected: compile failure because `PaymentFrequency`, `EMPLOYEE_SIGNED`, `FINALIZED`, and `findPayrollActiveForPeriod` do not exist yet.

- [ ] **Step 3: Add payment frequency enum**

Create `Program/microservice/contract-service/src/main/java/com/pm/contractservice/model/PaymentFrequency.java`:

```java
package com.pm.contractservice.model;

import java.util.Locale;

public enum PaymentFrequency {
    DAILY,
    WEEKLY,
    BIWEEKLY,
    MONTHLY,
    EVERY_5_MINUTES;

    public static PaymentFrequency fromNullable(String value) {
        if (value == null || value.isBlank()) {
            return WEEKLY;
        }
        return PaymentFrequency.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }

    public boolean isProductionAllowed() {
        return this != EVERY_5_MINUTES;
    }
}
```

- [ ] **Step 4: Add contract workflow statuses**

Replace `Program/microservice/contract-service/src/main/java/com/pm/contractservice/model/ContractStatus.java` with:

```java
package com.pm.contractservice.model;

public enum ContractStatus {
    DRAFT,
    SENT_TO_EMPLOYEE,
    EMPLOYEE_SIGNED,
    FINALIZED,
    REJECTED,
    EXPIRED,
    SIGNED;

    public boolean isPayrollActive() {
        return this == FINALIZED || this == SIGNED;
    }
}
```

`SIGNED` remains for existing database rows and is treated as payroll-active.

- [ ] **Step 5: Update Contract entity**

In `Program/microservice/contract-service/src/main/java/com/pm/contractservice/model/Contract.java`, replace the string payment frequency field with:

```java
@Enumerated(EnumType.STRING)
@Column(length = 40, nullable = false)
private PaymentFrequency paymentFrequency = PaymentFrequency.WEEKLY;
```

Add workflow fields:

```java
@Column(length = 2000)
private String reviewComment;

private java.time.OffsetDateTime sentToEmployeeAt;
private java.time.OffsetDateTime employeeSignedAt;
private java.time.OffsetDateTime finalizedAt;
private java.time.OffsetDateTime rejectedAt;
```

Replace getter/setter signatures for payment frequency:

```java
public PaymentFrequency getPaymentFrequency() {
    return paymentFrequency;
}

public void setPaymentFrequency(PaymentFrequency paymentFrequency) {
    this.paymentFrequency = paymentFrequency == null ? PaymentFrequency.WEEKLY : paymentFrequency;
}
```

Add normal getters and setters for the workflow fields.

- [ ] **Step 6: Add review request DTO**

Create `Program/microservice/contract-service/src/main/java/com/pm/contractservice/dto/ContractReviewRequestDTO.java`:

```java
package com.pm.contractservice.dto;

public class ContractReviewRequestDTO {
    private String comment;

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
```

- [ ] **Step 7: Map payment frequency and workflow fields**

In `ContractMapper.toDTO`, set:

```java
contractResponseDTO.setPaymentFrequency(contract.getPaymentFrequency() == null ? null : contract.getPaymentFrequency().name());
contractResponseDTO.setReviewComment(contract.getReviewComment());
contractResponseDTO.setSentToEmployeeAt(asString(contract.getSentToEmployeeAt()));
contractResponseDTO.setEmployeeSignedAt(asString(contract.getEmployeeSignedAt()));
contractResponseDTO.setFinalizedAt(asString(contract.getFinalizedAt()));
contractResponseDTO.setRejectedAt(asString(contract.getRejectedAt()));
```

Add helper:

```java
private static String asString(Object value) {
    return value == null ? null : value.toString();
}
```

In `ContractMapper.toModel`, set:

```java
contract.setPaymentFrequency(PaymentFrequency.fromNullable(contractRequestDTO.getPaymentFrequency()));
```

- [ ] **Step 8: Update ContractResponseDTO workflow fields**

In `ContractResponseDTO`, change `paymentFrequency` to `String` and add:

```java
private String reviewComment;
private String sentToEmployeeAt;
private String employeeSignedAt;
private String finalizedAt;
private String rejectedAt;
```

Add getters and setters for each field.

- [ ] **Step 9: Add payroll-active repository query**

In `ContractRepository`, replace payroll use of `findSignedActiveForPeriod` with:

```java
@Query("""
        select c from Contract c
        where c.userId = :userId
          and c.status in (
              com.pm.contractservice.model.ContractStatus.FINALIZED,
              com.pm.contractservice.model.ContractStatus.SIGNED
          )
          and c.startDate <= :periodEnd
          and (c.endDate is null or c.endDate >= :periodStart)
        order by c.startDate desc
        """)
List<Contract> findPayrollActiveForPeriod(
        @Param("userId") UUID userId,
        @Param("periodStart") LocalDate periodStart,
        @Param("periodEnd") LocalDate periodEnd
);
```

- [ ] **Step 10: Add service workflow methods**

In `ContractService`, add:

```java
public ContractResponseDTO sendContract(UUID contractId) {
    Contract contract = contractValidator.getExistingContract(contractId);
    contract.setStatus(ContractStatus.SENT_TO_EMPLOYEE);
    contract.setSentToEmployeeAt(java.time.OffsetDateTime.now());
    contract.setReviewComment(null);
    return ContractMapper.toDTO(contractRepository.save(contract));
}

public ContractResponseDTO signContract(UUID contractId, UUID userId) {
    Contract contract = contractValidator.getExistingContract(contractId);
    if (!contract.getUserId().equals(userId)) {
        throw new org.springframework.security.access.AccessDeniedException("Cannot sign another user's contract");
    }
    if (contract.getStatus() != ContractStatus.SENT_TO_EMPLOYEE && contract.getStatus() != ContractStatus.REJECTED) {
        throw new IllegalStateException("Contract is not waiting for employee signature");
    }
    contract.setStatus(ContractStatus.EMPLOYEE_SIGNED);
    contract.setEmployeeSignedAt(java.time.OffsetDateTime.now());
    contract.setReviewComment(null);
    return ContractMapper.toDTO(contractRepository.save(contract));
}

public ContractResponseDTO finalizeContractById(UUID contractId) {
    Contract contract = contractValidator.getExistingContract(contractId);
    if (contract.getStatus() != ContractStatus.EMPLOYEE_SIGNED && contract.getStatus() != ContractStatus.SIGNED) {
        throw new IllegalStateException("Only employee-signed contracts can be finalized");
    }
    contract.setStatus(ContractStatus.FINALIZED);
    contract.setFinalizedAt(java.time.OffsetDateTime.now());
    contract.setReviewComment(null);
    byte[] pdfData = contractPdfGenerator.generate(contract, buildUserProfile(userServiceGrpcClient.requestUserData(contract.getUserId().toString())));
    contract.setPdfData(pdfData);
    contract = contractRepository.save(contract);
    contractEventPublisher.publishEmployeeRegistered(contract, buildUserProfile(userServiceGrpcClient.requestUserData(contract.getUserId().toString())));
    return ContractMapper.toDTO(contract);
}

public ContractResponseDTO rejectContract(UUID contractId, String comment) {
    if (comment == null || comment.isBlank()) {
        throw new IllegalArgumentException("Comment is required when rejecting a contract");
    }
    Contract contract = contractValidator.getExistingContract(contractId);
    contract.setStatus(ContractStatus.REJECTED);
    contract.setRejectedAt(java.time.OffsetDateTime.now());
    contract.setReviewComment(comment.trim());
    return ContractMapper.toDTO(contractRepository.save(contract));
}
```

- [ ] **Step 11: Add controller endpoints**

In `ContractController`, add:

```java
@PostMapping("/{id}/send")
@PreAuthorize("hasAuthority('CAN_MANAGE_CONTRACTS')")
public ResponseEntity<ContractResponseDTO> sendContract(@PathVariable UUID id) {
    return ResponseEntity.ok(contractService.sendContract(id));
}

@PostMapping("/{id}/sign")
@PreAuthorize("hasAuthority('CAN_SIGN_OWN_CONTRACTS') and @contractPermission.isOwner(#id, authentication)")
public ResponseEntity<ContractResponseDTO> signContract(@PathVariable UUID id, Authentication authentication) {
    UUID userId = UUID.fromString(authentication.getName());
    return ResponseEntity.ok(contractService.signContract(id, userId));
}

@PostMapping("/{id}/finalize")
@PreAuthorize("hasAuthority('CAN_FINALIZE_CONTRACT')")
public ResponseEntity<ContractResponseDTO> finalizeContractById(@PathVariable UUID id) {
    return ResponseEntity.ok(contractService.finalizeContractById(id));
}

@PostMapping("/{id}/reject")
@PreAuthorize("hasAuthority('CAN_REVIEW_CONTRACTS')")
public ResponseEntity<ContractResponseDTO> rejectContract(
        @PathVariable UUID id,
        @RequestBody ContractReviewRequestDTO request
) {
    return ResponseEntity.ok(contractService.rejectContract(id, request.getComment()));
}
```

Change list/view permissions from `CAN_VIEW_CONTRACTS` to:

```java
@PreAuthorize("hasAuthority('CAN_VIEW_ALL_CONTRACTS')")
```

Keep own-contract download available through `@contractPermission.isOwner`.

- [ ] **Step 12: Run contract tests**

Run:

```powershell
cd Program/microservice/contract-service
mvn test
```

Expected: all contract-service tests pass.

- [ ] **Step 13: Commit contract workflow**

```powershell
git add Program/microservice/contract-service/src/main/java/com/pm/contractservice Program/microservice/contract-service/src/test/java/com/pm/contractservice
git commit -m "Add contract signing workflow states"
```

---

## Task 3: Onboarding Sends Contract Payment Frequency

**Files:**
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/model/UserStatus.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/AdminOnboardingRequestDTO.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/dto/ContractDraftRequestDTO.java`
- Modify: `Program/microservice/user-service/src/main/java/com/pm/userservice/service/OnboardingService.java`
- Modify: `Program/frontend/src/services/user-service/Types.ts`
- Modify: `Program/frontend/src/pages/AdminOnboarding.tsx`

- [ ] **Step 1: Update user statuses**

Replace `UserStatus` with:

```java
package com.pm.userservice.model;

public enum UserStatus {
    PENDING_SETUP,
    PENDING_PROFILE_REVIEW,
    CHANGES_REQUESTED,
    PENDING_CONTRACT_SIGNATURE,
    PENDING_CONTRACT_REVIEW,
    ACTIVE
}
```

- [ ] **Step 2: Add payment frequency to user-service onboarding DTOs**

In `AdminOnboardingRequestDTO` and `ContractDraftRequestDTO`, add:

```java
private String paymentFrequency;

public String getPaymentFrequency() {
    return paymentFrequency;
}

public void setPaymentFrequency(String paymentFrequency) {
    this.paymentFrequency = paymentFrequency;
}
```

- [ ] **Step 3: Forward payment frequency when creating contract draft**

In `OnboardingService.adminOnboard`, after travel allowance:

```java
contractRequest.setPaymentFrequency(
        StringUtils.defaultIfBlank(request.getPaymentFrequency(), "WEEKLY")
);
```

- [ ] **Step 4: Stop auto-finalizing contract during employee setup**

In `OnboardingService.completeUserSetup`, remove:

```java
contractServiceClient.finalizeContract(accessToken);
user.setStatus(UserStatus.ACTIVE);
```

Replace it with:

```java
user.setStatus(UserStatus.PENDING_PROFILE_REVIEW);
```

This preserves the user profile after setup but prevents payroll-active status until profile and contract review are complete.

- [ ] **Step 5: Add frontend onboarding type field**

In `Program/frontend/src/services/user-service/Types.ts`, add to `AdminOnboardingRequestDTO`:

```ts
paymentFrequency?: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | string;
```

- [ ] **Step 6: Add payment frequency selector to management onboarding**

In `Program/frontend/src/pages/AdminOnboarding.tsx`, add state:

```ts
const [paymentFrequency, setPaymentFrequency] = useState<"DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY">("WEEKLY");
```

Add it to the payload:

```ts
paymentFrequency,
```

Add a select field near contract type:

```tsx
<div className="form_row">
    <label className="adminOnboardingLabel">Payment frequency</label>
    <select
        className="modal_input"
        value={paymentFrequency}
        onChange={(e) => setPaymentFrequency(e.target.value as typeof paymentFrequency)}
    >
        <option value="DAILY">Daily</option>
        <option value="WEEKLY">Weekly</option>
        <option value="BIWEEKLY">Biweekly</option>
        <option value="MONTHLY">Monthly</option>
    </select>
</div>
```

Do not show `EVERY_5_MINUTES` in this production-facing form.

- [ ] **Step 7: Run user-service and frontend builds**

Run:

```powershell
cd Program/microservice/user-service
mvn test
```

Expected: user-service compiles and tests pass.

Run:

```powershell
cd Program/frontend
npm run build
```

Expected: TypeScript and Vite build pass.

- [ ] **Step 8: Commit onboarding frequency**

```powershell
git add Program/microservice/user-service/src/main/java/com/pm/userservice/model/UserStatus.java Program/microservice/user-service/src/main/java/com/pm/userservice/dto/AdminOnboardingRequestDTO.java Program/microservice/user-service/src/main/java/com/pm/userservice/dto/ContractDraftRequestDTO.java Program/microservice/user-service/src/main/java/com/pm/userservice/service/OnboardingService.java Program/frontend/src/services/user-service/Types.ts Program/frontend/src/pages/AdminOnboarding.tsx
git commit -m "Send contract payment frequency from onboarding"
```

---

## Task 4: Contract-Owned Payroll Scheduling And Zero-Hour Rules

**Files:**
- Create: `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/service/PayPeriod.java`
- Create: `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/service/PayPeriodCalculator.java`
- Modify: `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/model/Payslip.java`
- Modify: `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/dto/PayslipResponseDTO.java`
- Modify: `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/mapper/PayslipMapper.java`
- Modify: `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/service/PayrollService.java`
- Modify: `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/scheduler/PayslipScheduler.java`
- Test: `Program/microservice/payroll-service/src/test/java/com/pm/payrollservice/service/PayPeriodCalculatorTest.java`
- Test: `Program/microservice/payroll-service/src/test/java/com/pm/payrollservice/service/PayrollZeroHourRuleTest.java`

- [ ] **Step 1: Add failing pay period tests**

Create `PayPeriodCalculatorTest.java`:

```java
package com.pm.payrollservice.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class PayPeriodCalculatorTest {
    private final PayPeriodCalculator calculator = new PayPeriodCalculator();

    @Test
    void weeklyPeriodUsesIsoWeek() {
        PayPeriod period = calculator.periodFor("WEEKLY", LocalDate.of(2026, 5, 12));

        assertThat(period.start()).isEqualTo(LocalDate.of(2026, 5, 11));
        assertThat(period.end()).isEqualTo(LocalDate.of(2026, 5, 17));
        assertThat(period.key()).isEqualTo("WEEKLY:2026-W20");
    }

    @Test
    void monthlyPeriodUsesCalendarMonth() {
        PayPeriod period = calculator.periodFor("MONTHLY", LocalDate.of(2026, 5, 12));

        assertThat(period.start()).isEqualTo(LocalDate.of(2026, 5, 1));
        assertThat(period.end()).isEqualTo(LocalDate.of(2026, 5, 31));
        assertThat(period.key()).isEqualTo("MONTHLY:2026-05");
    }
}
```

- [ ] **Step 2: Run pay period test and verify it fails**

Run:

```powershell
cd Program/microservice/payroll-service
mvn -Dtest=PayPeriodCalculatorTest test
```

Expected: compile failure because `PayPeriod` and `PayPeriodCalculator` do not exist.

- [ ] **Step 3: Add PayPeriod value object**

Create `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/service/PayPeriod.java`:

```java
package com.pm.payrollservice.service;

import java.time.LocalDate;

public record PayPeriod(String frequency, LocalDate start, LocalDate end, String key) {
}
```

- [ ] **Step 4: Add PayPeriodCalculator**

Create `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/service/PayPeriodCalculator.java`:

```java
package com.pm.payrollservice.service;

import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.time.temporal.WeekFields;
import java.util.Locale;

@Component
public class PayPeriodCalculator {
    public PayPeriod periodFor(String rawFrequency, LocalDate anchorDate) {
        String frequency = rawFrequency == null || rawFrequency.isBlank()
                ? "WEEKLY"
                : rawFrequency.trim().toUpperCase(Locale.ROOT);

        return switch (frequency) {
            case "DAILY" -> new PayPeriod("DAILY", anchorDate, anchorDate, "DAILY:" + anchorDate);
            case "BIWEEKLY" -> biweekly(anchorDate);
            case "MONTHLY" -> monthly(anchorDate);
            case "EVERY_5_MINUTES" -> new PayPeriod("EVERY_5_MINUTES", anchorDate, anchorDate, "EVERY_5_MINUTES:" + anchorDate);
            default -> weekly(anchorDate);
        };
    }

    private PayPeriod weekly(LocalDate anchorDate) {
        LocalDate start = anchorDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate end = start.plusDays(6);
        WeekFields iso = WeekFields.ISO;
        int week = anchorDate.get(iso.weekOfWeekBasedYear());
        int year = anchorDate.get(iso.weekBasedYear());
        return new PayPeriod("WEEKLY", start, end, "WEEKLY:" + year + "-W" + week);
    }

    private PayPeriod biweekly(LocalDate anchorDate) {
        PayPeriod week = weekly(anchorDate);
        int isoWeek = anchorDate.get(WeekFields.ISO.weekOfWeekBasedYear());
        LocalDate start = isoWeek % 2 == 0 ? week.start().minusDays(7) : week.start();
        LocalDate end = start.plusDays(13);
        return new PayPeriod("BIWEEKLY", start, end, "BIWEEKLY:" + start + ":" + end);
    }

    private PayPeriod monthly(LocalDate anchorDate) {
        LocalDate start = anchorDate.withDayOfMonth(1);
        LocalDate end = anchorDate.withDayOfMonth(anchorDate.lengthOfMonth());
        return new PayPeriod("MONTHLY", start, end, "MONTHLY:" + start.getYear() + "-" + String.format(Locale.ROOT, "%02d", start.getMonthValue()));
    }
}
```

- [ ] **Step 5: Add contract snapshot fields to Payslip**

In `Payslip.java`, add:

```java
private UUID contractId;
private String contractType;
private String paymentFrequency;
private LocalDate contractStartDate;
private LocalDate contractEndDate;
@Column(precision = 5, scale = 2)
private BigDecimal weeklyHours;
@Column(precision = 5, scale = 2)
private BigDecimal holidayAllowancePercentage;
@Column(length = 120)
private String payPeriodKey;
private LocalDate payPeriodStart;
private LocalDate payPeriodEnd;
```

Add getters and setters for each field.

- [ ] **Step 6: Map contract snapshot fields**

In `PayslipMapper.updateFromContractData`, add:

```java
if (!contractData.getContractId().isBlank()) {
    payslip.setContractId(UUID.fromString(contractData.getContractId()));
}
payslip.setContractType(contractData.getContractType());
payslip.setPaymentFrequency(contractData.getPaymentFrequency());
payslip.setContractStartDate(LocalDate.parse(contractData.getStartDate()));
if (!contractData.getEndDate().isBlank()) {
    payslip.setContractEndDate(LocalDate.parse(contractData.getEndDate()));
}
if (!contractData.getWeeklyHours().isBlank()) {
    payslip.setWeeklyHours(new BigDecimal(contractData.getWeeklyHours()));
}
if (!contractData.getHolidayAllowancePercentage().isBlank()) {
    payslip.setHolidayAllowancePercentage(new BigDecimal(contractData.getHolidayAllowancePercentage()));
}
```

In `PayslipMapper.toDTO`, set matching DTO fields:

```java
payslipResponseDTO.setContractId(asString(payslip.getContractId()));
payslipResponseDTO.setContractType(payslip.getContractType());
payslipResponseDTO.setPaymentFrequency(payslip.getPaymentFrequency());
payslipResponseDTO.setContractStartDate(asString(payslip.getContractStartDate()));
payslipResponseDTO.setContractEndDate(asString(payslip.getContractEndDate()));
payslipResponseDTO.setWeeklyHours(payslip.getWeeklyHours());
payslipResponseDTO.setHolidayAllowancePercentage(payslip.getHolidayAllowancePercentage());
payslipResponseDTO.setPayPeriodKey(payslip.getPayPeriodKey());
payslipResponseDTO.setPayPeriodStart(asString(payslip.getPayPeriodStart()));
payslipResponseDTO.setPayPeriodEnd(asString(payslip.getPayPeriodEnd()));
```

- [ ] **Step 7: Add DTO fields**

In `PayslipResponseDTO`, add the same fields from Step 5 using `String` for IDs/dates and `BigDecimal` for numeric values, then add getters and setters.

- [ ] **Step 8: Change scheduler to delegate contract-owned generation**

In `PayslipScheduler`, remove:

```java
int frequencyMinutes = userRow.payslipFrequencyMinutes() != null
        ? userRow.payslipFrequencyMinutes()
        : DEFAULT_PAYOUT_FREQUENCY_MINUTES;
```

Remove `DEFAULT_PAYOUT_FREQUENCY_MINUTES`.

Replace due calculation with:

```java
periodEnd = LocalDate.parse(summary.getDateOfIssue());
```

Then replace:

```java
payrollService.syncScheduledPayslip(userId, periodEnd, dueAt.toLocalDate());
```

with:

```java
payrollService.syncContractOwnedScheduledPayslip(userId, periodEnd, now.toLocalDate());
```

- [ ] **Step 9: Add payroll service method and zero-hour rules**

In `PayrollService`, inject `PayPeriodCalculator`.

Add method:

```java
public PayslipResponseDTO syncContractOwnedScheduledPayslip(UUID userId, LocalDate anchorDate, LocalDate today) {
    ContractDataResponse contractData = contractServiceGrpcClient.requestContractData(userId.toString(), anchorDate, anchorDate);
    PayPeriod period = payPeriodCalculator.periodFor(contractData.getPaymentFrequency(), anchorDate);
    if (today.isBefore(period.end())) {
        return null;
    }

    Payslip payslip = findExistingByPeriodKey(userId, period.key());
    if (payslip == null) {
        payslip = new Payslip();
        payslip.setUserId(userId);
        payslip.setGeneratedAt(OffsetDateTime.now());
    }

    payslip.setDateOfIssue(period.end());
    payslip.setPayPeriodKey(period.key());
    payslip.setPayPeriodStart(period.start());
    payslip.setPayPeriodEnd(period.end());
    payslip.setWeekNumber(period.end().get(WeekFields.ISO.weekOfWeekBasedYear()));
    payslip.setWeekBasedYear(period.end().get(WeekFields.ISO.weekBasedYear()));
    payslip.setStatus(PayslipStatus.PENDING_REVIEW);
    payslip.setAvailableToUserAt(today);

    TimesheetFetchResult fetchResult = populatePayslipData(payslip, userId, payslip.getWeekNumber(), payslip.getWeekBasedYear());
    PayslipCalculator.apply(payslip);

    if (shouldSkipZeroPayPeriod(payslip, contractData)) {
        log.info("Skipping zero-pay payslip for userId={} period={}", userId, period.key());
        return null;
    }

    applyDiscrepancyStatus(payslip, fetchResult, PayslipStatus.PENDING_REVIEW);
    return PayslipMapper.toDTO(payslipRepository.save(payslip));
}
```

Add helpers:

```java
private Payslip findExistingByPeriodKey(UUID userId, String payPeriodKey) {
    return payslipRepository.findByUserIdAndPayPeriodKey(userId, payPeriodKey).orElse(null);
}

private boolean shouldSkipZeroPayPeriod(Payslip payslip, ContractDataResponse contractData) {
    BigDecimal hours = safe(payslip.getTotalHoursWorked());
    BigDecimal travel = safe(payslip.getTravelExpenses());
    BigDecimal net = safe(payslip.getTotalNetAmount());
    boolean onCall = contractData.getContractType() != null && contractData.getContractType().startsWith("ON_CALL");
    return onCall
            && hours.compareTo(BigDecimal.ZERO) == 0
            && travel.compareTo(BigDecimal.ZERO) == 0
            && net.compareTo(BigDecimal.ZERO) == 0;
}
```

Add repository method:

```java
Optional<Payslip> findByUserIdAndPayPeriodKey(UUID userId, String payPeriodKey);
```

- [ ] **Step 10: Run payroll tests**

Run:

```powershell
cd Program/microservice/payroll-service
mvn test
```

Expected: all payroll-service tests pass.

- [ ] **Step 11: Commit payroll scheduling**

```powershell
git add Program/microservice/payroll-service/src/main/java/com/pm/payrollservice Program/microservice/payroll-service/src/test/java/com/pm/payrollservice
git commit -m "Use contract frequency for payroll scheduling"
```

---

## Task 5: Contract gRPC Snapshot

**Files:**
- Modify: `Program/microservice/contract-service/src/main/proto/contract_service.proto`
- Modify: `Program/microservice/payroll-service/src/main/proto/contract_service.proto`
- Modify: `Program/microservice/contract-service/src/main/java/com/pm/contractservice/grpc/ContractGrpcService.java`
- Modify: `Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/grpc/ContractServiceGrpcClient.java`

- [ ] **Step 1: Update both contract proto files**

In both proto files, change `ContractDataResponse` to:

```proto
message ContractDataResponse {
  string startDate = 1;
  string endDate = 2;
  string contractType = 3;
  string grossHourlyWage = 4;
  bool travelAllowance = 5;
  string functionId = 6;
  string functionName = 7;
  string paymentFrequency = 8;
  string weeklyHours = 9;
  string holidayAllowancePercentage = 10;
  int32 leaveEntitlementDays = 11;
  string contractId = 12;
  string status = 13;
}
```

- [ ] **Step 2: Regenerate gRPC sources**

Run:

```powershell
cd Program/microservice/contract-service
mvn generate-sources
```

Expected: generated protobuf classes include `getContractId()` and `getStatus()`.

Run:

```powershell
cd Program/microservice/payroll-service
mvn generate-sources
```

Expected: generated protobuf classes include `getContractId()` and `getStatus()`.

- [ ] **Step 3: Update contract gRPC service**

In `ContractGrpcService`, replace repository lookup with `findPayrollActiveForPeriod`.

Add response fields:

```java
.setContractId(contract.getContractId().toString())
.setStatus(contract.getStatus().name())
.setPaymentFrequency(contract.getPaymentFrequency() == null ? "WEEKLY" : contract.getPaymentFrequency().name())
```

- [ ] **Step 4: Run contract and payroll compilation**

Run:

```powershell
cd Program/microservice/contract-service
mvn test
```

Expected: contract-service tests pass.

Run:

```powershell
cd Program/microservice/payroll-service
mvn test
```

Expected: payroll-service tests pass.

- [ ] **Step 5: Commit gRPC snapshot fields**

```powershell
git add Program/microservice/contract-service/src/main/proto/contract_service.proto Program/microservice/payroll-service/src/main/proto/contract_service.proto Program/microservice/contract-service/src/main/java/com/pm/contractservice/grpc/ContractGrpcService.java Program/microservice/payroll-service/src/main/java/com/pm/payrollservice/grpc/ContractServiceGrpcClient.java
git commit -m "Expose contract snapshot data to payroll"
```

---

## Task 6: Employee Contract UI And Services

**Files:**
- Modify: `Program/frontend/src/services/user-service/GetContracts.ts`
- Modify: `Program/frontend/src/services/user-service/UserServices.ts`
- Modify: `Program/frontend/src/pages/AccountEmploymentDetails.tsx`
- Modify: `Program/frontend/src/stylesheets/Profile.css`
- Test: `Program/frontend/src/pages/AccountEmploymentDetails.test.tsx`

- [ ] **Step 1: Add frontend contract types and workflow clients**

In `GetContracts.ts`, add:

```ts
export type ContractStatus =
    | "DRAFT"
    | "SENT_TO_EMPLOYEE"
    | "EMPLOYEE_SIGNED"
    | "FINALIZED"
    | "REJECTED"
    | "EXPIRED"
    | "SIGNED"
    | string;

export type PaymentFrequency = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "EVERY_5_MINUTES" | string;
```

Update `ContractResponseDTO` fields:

```ts
status?: ContractStatus | null;
paymentFrequency?: PaymentFrequency | null;
reviewComment?: string | null;
sentToEmployeeAt?: string | null;
employeeSignedAt?: string | null;
finalizedAt?: string | null;
rejectedAt?: string | null;
```

Add workflow functions:

```ts
export async function SignContract(API_BASE_URL: string, contractId: string): Promise<ContractResponseDTO> {
    const res = await axios.post<ContractResponseDTO>(`${API_BASE_URL}/api/contract/${contractId}/sign`, null, {
        withCredentials: true,
    });
    return res.data;
}

export async function SendContract(API_BASE_URL: string, contractId: string): Promise<ContractResponseDTO> {
    const res = await axios.post<ContractResponseDTO>(`${API_BASE_URL}/api/contract/${contractId}/send`, null, {
        withCredentials: true,
    });
    return res.data;
}

export async function FinalizeContract(API_BASE_URL: string, contractId: string): Promise<ContractResponseDTO> {
    const res = await axios.post<ContractResponseDTO>(`${API_BASE_URL}/api/contract/${contractId}/finalize`, null, {
        withCredentials: true,
    });
    return res.data;
}

export async function RejectContract(API_BASE_URL: string, contractId: string, comment: string): Promise<ContractResponseDTO> {
    const res = await axios.post<ContractResponseDTO>(
        `${API_BASE_URL}/api/contract/${contractId}/reject`,
        { comment },
        { withCredentials: true }
    );
    return res.data;
}
```

- [ ] **Step 2: Export workflow functions from UserServices**

In `UserServices.ts`, import workflow functions and add:

```ts
signContract: async (contractId: string): Promise<ContractResponseDTO> => {
    return await SignContract(API_BASE_URL, contractId);
},
sendContract: async (contractId: string): Promise<ContractResponseDTO> => {
    return await SendContract(API_BASE_URL, contractId);
},
finalizeContract: async (contractId: string): Promise<ContractResponseDTO> => {
    return await FinalizeContract(API_BASE_URL, contractId);
},
rejectContract: async (contractId: string, comment: string): Promise<ContractResponseDTO> => {
    return await RejectContract(API_BASE_URL, contractId, comment);
},
```

- [ ] **Step 3: Update Account Employment UI**

In `AccountEmploymentDetails.tsx`, load both current contract and contract history:

```ts
const [contracts, setContracts] = useState<ContractResponseDTO[]>([]);
```

Inside the effect, replace single fetch with:

```ts
Promise.all([UserServices.getCurrentContract(), UserServices.getMyContracts()])
    .then(([contract, history]) => {
        if (cancelled) return;
        setCurrentContract(contract);
        setContracts(history ?? []);
    })
```

Add helpers:

```ts
const formatFrequency = (value?: string | null) => {
    switch (value) {
        case "DAILY": return "Daily";
        case "WEEKLY": return "Weekly";
        case "BIWEEKLY": return "Biweekly";
        case "MONTHLY": return "Monthly";
        case "EVERY_5_MINUTES": return "Test only";
        default: return value ?? "-";
    }
};

const canSign = currentContract?.status === "SENT_TO_EMPLOYEE" || currentContract?.status === "REJECTED";
```

Add a row:

```tsx
<div className="profile_info_row">
    <span className="profile_info_label">Payment frequency</span>
    <span className="profile_info_value">{formatFrequency(currentContract?.paymentFrequency)}</span>
</div>
```

Add status row:

```tsx
<div className="profile_info_row">
    <span className="profile_info_label">Contract status</span>
    <span className="profile_info_value">{formatValue(currentContract?.status)}</span>
</div>
```

Add sign action next to download:

```tsx
{canSign ? (
    <button
        className="button"
        type="button"
        onClick={() => void signCurrentContract()}
    >
        Sign contract
    </button>
) : null}
```

Add `signCurrentContract`:

```ts
const signCurrentContract = async () => {
    if (!currentContract) return;
    try {
        const updated = await UserServices.signContract(currentContract.contractId);
        setCurrentContract(updated);
        setContracts((rows) => rows.map((row) => row.contractId === updated.contractId ? updated : row));
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to sign contract.";
        setContractError(message);
    }
};
```

Below the main card rows, add contract history:

```tsx
<div className="contractHistory">
    <h3>Contract history</h3>
    {contracts.length === 0 ? <p className="helperText">No contracts found.</p> : null}
    {contracts.map((contract) => (
        <div className="contractHistoryRow" key={contract.contractId}>
            <span>{formatValue(contract.startDate)} - {contract.endDate ? formatValue(contract.endDate) : "Open-ended"}</span>
            <span>{formatFrequency(contract.paymentFrequency)}</span>
            <span>{formatValue(contract.status)}</span>
        </div>
    ))}
</div>
```

- [ ] **Step 4: Add compact history styling**

In `Profile.css`, add:

```css
.contractHistory {
    margin-top: 20px;
    display: grid;
    gap: 8px;
}

.contractHistory h3 {
    margin: 0;
    font-size: 16px;
}

.contractHistoryRow {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(120px, 0.8fr) minmax(120px, 0.8fr);
    gap: 12px;
    align-items: center;
    padding: 10px 0;
    border-top: 1px solid #e5e7eb;
}
```

- [ ] **Step 5: Build frontend**

Run:

```powershell
cd Program/frontend
npm run build
```

Expected: TypeScript and Vite build pass.

- [ ] **Step 6: Commit employee contract UI**

```powershell
git add Program/frontend/src/services/user-service/GetContracts.ts Program/frontend/src/services/user-service/UserServices.ts Program/frontend/src/pages/AccountEmploymentDetails.tsx Program/frontend/src/stylesheets/Profile.css
git commit -m "Show employee contracts in account"
```

---

## Task 7: Documentation, Verification, And Push

**Files:**
- Modify: `Project Plan/Rundown/ParadePaardRundown.tex`

- [ ] **Step 1: Update the rundown**

In `Project Plan/Rundown/ParadePaardRundown.tex`, update these sections after implementation:

- Employee Onboarding Page: describe employee setup status moving to profile review instead of immediately active.
- Management Employee Onboarding Page: describe payment frequency selection and workflow review.
- Account Employment Details Page: describe contract status, payment frequency, contract history, sign action, and PDF download.
- Management User Detail Page: describe contract timeline and contract review actions when visible.
- Company Settings Page: clarify employee payment frequency comes from contracts, not company settings.
- Payslips Page and Payslip Detail Page: describe missing/finalized-contract review reasons and contract snapshot fields.

Add newest change-log item at the top:

```tex
\item 2026 05 12: Added contract-owned payment frequency, employee contract visibility, contract signing status, and payroll review behavior.
```

- [ ] **Step 2: Run final verification**

Run:

```powershell
cd Program/frontend
npm test
```

Expected: frontend tests pass.

Run:

```powershell
cd Program/frontend
npm run build
```

Expected: frontend build passes.

Run:

```powershell
cd Program/microservice/contract-service
mvn test
```

Expected: contract-service tests pass.

Run:

```powershell
cd Program/microservice/payroll-service
mvn test
```

Expected: payroll-service tests pass.

Run:

```powershell
cd Program/microservice/user-service
mvn test
```

Expected: user-service tests pass.

- [ ] **Step 3: Check git status**

Run:

```powershell
git status
```

Expected: only intentional implementation and rundown files are modified.

- [ ] **Step 4: Commit final rundown update if it was not committed earlier**

```powershell
git add 'Project Plan/Rundown/ParadePaardRundown.tex'
git commit -m "Update rundown for contract payroll workflow"
```

- [ ] **Step 5: Push all commits**

```powershell
git push
```

Expected: branch pushes successfully to GitHub.

## Plan Self-Review

- Spec coverage: This plan covers contract-owned payment frequency, employee contract visibility, signing/finalization states, explicit permissions, zero-hour payslip rules, payroll contract snapshots, frontend account display, onboarding payment frequency, and rundown updates.
- Intentional split: CV upload, ID upload storage, and full visual queue polish are excluded because they require separate storage and privacy design.
- Completeness scan: task steps use concrete files, commands, and code snippets instead of vague handoff notes.
- Type consistency: `PaymentFrequency`, `ContractStatus`, `ContractResponseDTO`, `PayPeriod`, and workflow endpoint names are defined before they are used by later tasks.
