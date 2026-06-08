package com.pm.userservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "horeca_rule_items")
public class HorecaRuleItem {
    @Id
    private UUID id;

    @Column(name = "rule_version_id", nullable = false)
    private UUID ruleVersionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "section_key", nullable = false)
    private HorecaRuleSection sectionKey;

    @Column(name = "item_key", nullable = false)
    private String itemKey;

    @Column(nullable = false)
    private String name;

    @Column(name = "value_text", length = 2000)
    private String valueText;

    @Column(name = "value_number", precision = 19, scale = 4)
    private BigDecimal valueNumber;

    @Column(name = "value_boolean")
    private Boolean valueBoolean;

    @Enumerated(EnumType.STRING)
    @Column(name = "value_type", nullable = false)
    private HorecaRuleValueType valueType;

    @Column(length = 255)
    private String unit;

    @Column(name = "calculation_rule", length = 1000)
    private String calculationRule;

    @Column(name = "document_name", length = 255)
    private String documentName;

    @Column(name = "document_url", length = 1000)
    private String documentUrl;

    @Column(name = "page_reference", length = 255)
    private String pageReference;

    @Column(name = "function_group", length = 64)
    private String functionGroup;

    @Column(name = "age_group", length = 64)
    private String ageGroup;

    @Column(name = "source_note", length = 2000)
    private String sourceNote;

    @Column(name = "used_in_contract", nullable = false)
    private boolean usedInContract;

    @Column(name = "used_in_payroll", nullable = false)
    private boolean usedInPayroll;

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

    public HorecaRuleSection getSectionKey() {
        return sectionKey;
    }

    public void setSectionKey(HorecaRuleSection sectionKey) {
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

    public HorecaRuleValueType getValueType() {
        return valueType;
    }

    public void setValueType(HorecaRuleValueType valueType) {
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
