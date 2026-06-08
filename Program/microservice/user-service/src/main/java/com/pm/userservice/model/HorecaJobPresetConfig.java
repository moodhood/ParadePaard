package com.pm.userservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "horeca_job_preset_configs")
public class HorecaJobPresetConfig {
    @Id
    private UUID id;

    @Column(name = "rule_version_id", nullable = false)
    private UUID ruleVersionId;

    @Column(name = "preset_key", nullable = false)
    private String presetKey;

    @Column(name = "preset_name", nullable = false)
    private String presetName;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(name = "job_function", nullable = false, length = 1000)
    private String jobFunction;

    @Column(name = "function_group", nullable = false)
    private String functionGroup;

    @Column(name = "default_contract_type", nullable = false)
    private String defaultContractType;

    @Column(name = "default_hourly_wage", precision = 19, scale = 2, nullable = false)
    private BigDecimal defaultHourlyWage;

    @Column(name = "default_monthly_wage", precision = 19, scale = 2)
    private BigDecimal defaultMonthlyWage;

    @Column(name = "default_hours_per_week", precision = 8, scale = 2)
    private BigDecimal defaultHoursPerWeek;

    @Column(name = "default_payroll_period", nullable = false)
    private String defaultPayrollPeriod;

    @Column(name = "pension_applicable", nullable = false)
    private boolean pensionApplicable;

    @Column(name = "holiday_allowance_mode", nullable = false)
    private String holidayAllowanceMode;

    @Column(name = "vacation_build_up_applicable", nullable = false)
    private boolean vacationBuildUpApplicable;

    @Column(name = "document_name", length = 255)
    private String documentName;

    @Column(name = "document_url", length = 1000)
    private String documentUrl;

    @Column(name = "page_reference", length = 255)
    private String pageReference;

    @Column(name = "source_note", length = 2000)
    private String sourceNote;

    @Column(name = "active", nullable = false)
    private boolean active;

    @Column(name = "admin_notes", length = 2000)
    private String adminNotes;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getRuleVersionId() {
        return ruleVersionId;
    }

    public void setRuleVersionId(UUID ruleVersionId) {
        this.ruleVersionId = ruleVersionId;
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
