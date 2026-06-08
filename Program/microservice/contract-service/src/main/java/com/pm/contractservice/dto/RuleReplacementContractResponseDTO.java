package com.pm.contractservice.dto;

public class RuleReplacementContractResponseDTO {
    private String contractId;
    private String userId;
    private String replacesContractId;
    private String derivedFromRuleVersionId;
    private String startDate;
    private String status;

    public String getContractId() {
        return contractId;
    }

    public void setContractId(String contractId) {
        this.contractId = contractId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getReplacesContractId() {
        return replacesContractId;
    }

    public void setReplacesContractId(String replacesContractId) {
        this.replacesContractId = replacesContractId;
    }

    public String getDerivedFromRuleVersionId() {
        return derivedFromRuleVersionId;
    }

    public void setDerivedFromRuleVersionId(String derivedFromRuleVersionId) {
        this.derivedFromRuleVersionId = derivedFromRuleVersionId;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
