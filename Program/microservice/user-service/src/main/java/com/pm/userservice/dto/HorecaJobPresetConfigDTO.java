package com.pm.userservice.dto;

import java.math.BigDecimal;

public class HorecaJobPresetConfigDTO {
    private String id;
    private String presetKey;
    private String presetName;
    private String jobTitle;
    private String jobFunction;
    private String functionGroup;
    private String defaultContractType;
    private BigDecimal defaultHourlyWage;
    private BigDecimal defaultMonthlyWage;
    private BigDecimal defaultHoursPerWeek;
    private String defaultPayrollPeriod;
    private boolean pensionApplicable;
    private String holidayAllowanceMode;
    private boolean vacationBuildUpApplicable;
    private String documentName;
    private String documentUrl;
    private String pageReference;
    private String sourceNote;
    private boolean active;
    private String adminNotes;
    private int sortOrder;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPresetKey() {
        return presetKey;
    }

    public void setPresetKey(String presetKey) {
        this.presetKey = presetKey;
    }

    public String getPresetName() {
        return presetName;
    }

    public void setPresetName(String presetName) {
        this.presetName = presetName;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getJobFunction() {
        return jobFunction;
    }

    public void setJobFunction(String jobFunction) {
        this.jobFunction = jobFunction;
    }

    public String getFunctionGroup() {
        return functionGroup;
    }

    public void setFunctionGroup(String functionGroup) {
        this.functionGroup = functionGroup;
    }

    public String getDefaultContractType() {
        return defaultContractType;
    }

    public void setDefaultContractType(String defaultContractType) {
        this.defaultContractType = defaultContractType;
    }

    public BigDecimal getDefaultHourlyWage() {
        return defaultHourlyWage;
    }

    public void setDefaultHourlyWage(BigDecimal defaultHourlyWage) {
        this.defaultHourlyWage = defaultHourlyWage;
    }

    public BigDecimal getDefaultMonthlyWage() {
        return defaultMonthlyWage;
    }

    public void setDefaultMonthlyWage(BigDecimal defaultMonthlyWage) {
        this.defaultMonthlyWage = defaultMonthlyWage;
    }

    public BigDecimal getDefaultHoursPerWeek() {
        return defaultHoursPerWeek;
    }

    public void setDefaultHoursPerWeek(BigDecimal defaultHoursPerWeek) {
        this.defaultHoursPerWeek = defaultHoursPerWeek;
    }

    public String getDefaultPayrollPeriod() {
        return defaultPayrollPeriod;
    }

    public void setDefaultPayrollPeriod(String defaultPayrollPeriod) {
        this.defaultPayrollPeriod = defaultPayrollPeriod;
    }

    public boolean isPensionApplicable() {
        return pensionApplicable;
    }

    public void setPensionApplicable(boolean pensionApplicable) {
        this.pensionApplicable = pensionApplicable;
    }

    public String getHolidayAllowanceMode() {
        return holidayAllowanceMode;
    }

    public void setHolidayAllowanceMode(String holidayAllowanceMode) {
        this.holidayAllowanceMode = holidayAllowanceMode;
    }

    public boolean isVacationBuildUpApplicable() {
        return vacationBuildUpApplicable;
    }

    public void setVacationBuildUpApplicable(boolean vacationBuildUpApplicable) {
        this.vacationBuildUpApplicable = vacationBuildUpApplicable;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public String getPageReference() {
        return pageReference;
    }

    public void setPageReference(String pageReference) {
        this.pageReference = pageReference;
    }

    public String getSourceNote() {
        return sourceNote;
    }

    public void setSourceNote(String sourceNote) {
        this.sourceNote = sourceNote;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }
}
