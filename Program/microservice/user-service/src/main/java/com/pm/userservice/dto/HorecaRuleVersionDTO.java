package com.pm.userservice.dto;

import java.util.List;
import java.util.Map;

public class HorecaRuleVersionDTO {
    private String versionId;
    private String companyId;
    private String versionLabel;
    private String status;
    private String effectiveFrom;
    private String effectiveTo;
    private String reason;
    private String sourceSummary;
    private String publishedAt;
    private String publishedByUserId;
    private Map<String, List<HorecaRuleItemDTO>> sections;
    private List<HorecaJobPresetConfigDTO> jobPresets;

    public String getVersionId() {
        return versionId;
    }

    public void setVersionId(String versionId) {
        this.versionId = versionId;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getVersionLabel() {
        return versionLabel;
    }

    public void setVersionLabel(String versionLabel) {
        this.versionLabel = versionLabel;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(String effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public String getEffectiveTo() {
        return effectiveTo;
    }

    public void setEffectiveTo(String effectiveTo) {
        this.effectiveTo = effectiveTo;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getSourceSummary() {
        return sourceSummary;
    }

    public void setSourceSummary(String sourceSummary) {
        this.sourceSummary = sourceSummary;
    }

    public String getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(String publishedAt) {
        this.publishedAt = publishedAt;
    }

    public String getPublishedByUserId() {
        return publishedByUserId;
    }

    public void setPublishedByUserId(String publishedByUserId) {
        this.publishedByUserId = publishedByUserId;
    }

    public Map<String, List<HorecaRuleItemDTO>> getSections() {
        return sections;
    }

    public void setSections(Map<String, List<HorecaRuleItemDTO>> sections) {
        this.sections = sections;
    }

    public List<HorecaJobPresetConfigDTO> getJobPresets() {
        return jobPresets;
    }

    public void setJobPresets(List<HorecaJobPresetConfigDTO> jobPresets) {
        this.jobPresets = jobPresets;
    }
}
