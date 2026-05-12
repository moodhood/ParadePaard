package com.pm.contractservice.dto;

import com.pm.contractservice.model.ContractType;
import com.pm.contractservice.model.ContractStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class ContractViewDTO {
    private UUID contractId;
    private UUID userId;
    private UUID functionId;
    private String functionName;
    private LocalDate startDate;
    private LocalDate endDate;
    private ContractType contractType;
    private ContractStatus status;
    private BigDecimal grossHourlyWage;
    private Boolean travelAllowance;
    private String paymentFrequency;
    private BigDecimal weeklyHours;
    private BigDecimal holidayAllowancePercentage;
    private Integer leaveEntitlementDays;
    private String workLocation;
    private String probationPeriod;
    private String noticePeriod;
    private String collectiveAgreement;
    private String pensionScheme;
    private String sicknessPolicy;
    private String confidentialityClause;
    private Boolean previouslyWorked;
    private UserProfileDTO userProfile;

    public UUID getContractId() {
        return contractId;
    }

    public void setContractId(UUID contractId) {
        this.contractId = contractId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getFunctionId() {
        return functionId;
    }

    public void setFunctionId(UUID functionId) {
        this.functionId = functionId;
    }

    public String getFunctionName() {
        return functionName;
    }

    public void setFunctionName(String functionName) {
        this.functionName = functionName;
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

    public ContractType getContractType() {
        return contractType;
    }

    public void setContractType(ContractType contractType) {
        this.contractType = contractType;
    }

    public ContractStatus getStatus() {
        return status;
    }

    public void setStatus(ContractStatus status) {
        this.status = status;
    }

    public BigDecimal getGrossHourlyWage() {
        return grossHourlyWage;
    }

    public void setGrossHourlyWage(BigDecimal grossHourlyWage) {
        this.grossHourlyWage = grossHourlyWage;
    }

    public Boolean getTravelAllowance() {
        return travelAllowance;
    }

    public void setTravelAllowance(Boolean travelAllowance) {
        this.travelAllowance = travelAllowance;
    }

    public String getPaymentFrequency() {
        return paymentFrequency;
    }

    public void setPaymentFrequency(String paymentFrequency) {
        this.paymentFrequency = paymentFrequency;
    }

    public BigDecimal getWeeklyHours() {
        return weeklyHours;
    }

    public void setWeeklyHours(BigDecimal weeklyHours) {
        this.weeklyHours = weeklyHours;
    }

    public BigDecimal getHolidayAllowancePercentage() {
        return holidayAllowancePercentage;
    }

    public void setHolidayAllowancePercentage(BigDecimal holidayAllowancePercentage) {
        this.holidayAllowancePercentage = holidayAllowancePercentage;
    }

    public Integer getLeaveEntitlementDays() {
        return leaveEntitlementDays;
    }

    public void setLeaveEntitlementDays(Integer leaveEntitlementDays) {
        this.leaveEntitlementDays = leaveEntitlementDays;
    }

    public String getWorkLocation() {
        return workLocation;
    }

    public void setWorkLocation(String workLocation) {
        this.workLocation = workLocation;
    }

    public String getProbationPeriod() {
        return probationPeriod;
    }

    public void setProbationPeriod(String probationPeriod) {
        this.probationPeriod = probationPeriod;
    }

    public String getNoticePeriod() {
        return noticePeriod;
    }

    public void setNoticePeriod(String noticePeriod) {
        this.noticePeriod = noticePeriod;
    }

    public String getCollectiveAgreement() {
        return collectiveAgreement;
    }

    public void setCollectiveAgreement(String collectiveAgreement) {
        this.collectiveAgreement = collectiveAgreement;
    }

    public String getPensionScheme() {
        return pensionScheme;
    }

    public void setPensionScheme(String pensionScheme) {
        this.pensionScheme = pensionScheme;
    }

    public String getSicknessPolicy() {
        return sicknessPolicy;
    }

    public void setSicknessPolicy(String sicknessPolicy) {
        this.sicknessPolicy = sicknessPolicy;
    }

    public String getConfidentialityClause() {
        return confidentialityClause;
    }

    public void setConfidentialityClause(String confidentialityClause) {
        this.confidentialityClause = confidentialityClause;
    }

    public Boolean getPreviouslyWorked() {
        return previouslyWorked;
    }

    public void setPreviouslyWorked(Boolean previouslyWorked) {
        this.previouslyWorked = previouslyWorked;
    }

    public UserProfileDTO getUserProfile() {
        return userProfile;
    }

    public void setUserProfile(UserProfileDTO userProfile) {
        this.userProfile = userProfile;
    }
}
