package com.pm.contractservice.service.events;

public class ContractCreatedEvent {
    private String contractId;
    private String userId;
    private String startDate;
    private String endDate;
    private String contractType;
    private String grossHourlyWage;
    private boolean travelAllowance;

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

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getContractType() {
        return contractType;
    }

    public void setContractType(String contractType) {
        this.contractType = contractType;
    }

    public String getGrossHourlyWage() {
        return grossHourlyWage;
    }

    public void setGrossHourlyWage(String grossHourlyWage) {
        this.grossHourlyWage = grossHourlyWage;
    }

    public boolean isTravelAllowance() {
        return travelAllowance;
    }

    public void setTravelAllowance(boolean travelAllowance) {
        this.travelAllowance = travelAllowance;
    }
}
