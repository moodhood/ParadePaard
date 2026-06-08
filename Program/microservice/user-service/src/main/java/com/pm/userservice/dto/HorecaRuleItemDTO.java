package com.pm.userservice.dto;

import java.math.BigDecimal;

public class HorecaRuleItemDTO {
    private String id;
    private String sectionKey;
    private String itemKey;
    private String name;
    private String valueText;
    private BigDecimal valueNumber;
    private Boolean valueBoolean;
    private String valueType;
    private String unit;
    private String calculationRule;
    private String documentName;
    private String documentUrl;
    private String pageReference;
    private String functionGroup;
    private String ageGroup;
    private String sourceNote;
    private boolean usedInContract;
    private boolean usedInPayroll;
    private int sortOrder;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSectionKey() {
        return sectionKey;
    }

    public void setSectionKey(String sectionKey) {
        this.sectionKey = sectionKey;
    }

    public String getItemKey() {
        return itemKey;
    }

    public void setItemKey(String itemKey) {
        this.itemKey = itemKey;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValueText() {
        return valueText;
    }

    public void setValueText(String valueText) {
        this.valueText = valueText;
    }

    public BigDecimal getValueNumber() {
        return valueNumber;
    }

    public void setValueNumber(BigDecimal valueNumber) {
        this.valueNumber = valueNumber;
    }

    public Boolean getValueBoolean() {
        return valueBoolean;
    }

    public void setValueBoolean(Boolean valueBoolean) {
        this.valueBoolean = valueBoolean;
    }

    public String getValueType() {
        return valueType;
    }

    public void setValueType(String valueType) {
        this.valueType = valueType;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getCalculationRule() {
        return calculationRule;
    }

    public void setCalculationRule(String calculationRule) {
        this.calculationRule = calculationRule;
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

    public String getFunctionGroup() {
        return functionGroup;
    }

    public void setFunctionGroup(String functionGroup) {
        this.functionGroup = functionGroup;
    }

    public String getAgeGroup() {
        return ageGroup;
    }

    public void setAgeGroup(String ageGroup) {
        this.ageGroup = ageGroup;
    }

    public String getSourceNote() {
        return sourceNote;
    }

    public void setSourceNote(String sourceNote) {
        this.sourceNote = sourceNote;
    }

    public boolean isUsedInContract() {
        return usedInContract;
    }

    public void setUsedInContract(boolean usedInContract) {
        this.usedInContract = usedInContract;
    }

    public boolean isUsedInPayroll() {
        return usedInPayroll;
    }

    public void setUsedInPayroll(boolean usedInPayroll) {
        this.usedInPayroll = usedInPayroll;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }
}
