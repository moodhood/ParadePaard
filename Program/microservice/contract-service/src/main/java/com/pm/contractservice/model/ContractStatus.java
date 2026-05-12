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
