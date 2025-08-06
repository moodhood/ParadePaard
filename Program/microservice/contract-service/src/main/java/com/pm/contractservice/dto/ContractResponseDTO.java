package com.pm.contractservice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class ContractResponseDTO {
    public UUID getContractId() {
        return contractId;
    }

    public void setContractId(UUID contractId) {
        this.contractId = contractId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getWageTaxAmountTest() {
        return wageTaxAmountTest;
    }

    public void setWageTaxAmountTest(BigDecimal wageTaxAmountTest) {
        this.wageTaxAmountTest = wageTaxAmountTest;
    }

    private UUID contractId;

    // Date
    private LocalDate startDate;
    private LocalDate endDate;

    // Contract Details
    private BigDecimal wageTaxAmountTest; //TODO test tax
}
