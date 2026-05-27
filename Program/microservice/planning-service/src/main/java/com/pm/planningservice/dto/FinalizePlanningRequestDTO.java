package com.pm.planningservice.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class FinalizePlanningRequestDTO {
    @NotNull
    private UUID companyId;

    private UUID projectId;
    private Integer isoWeek;
    private Integer weekBasedYear;

    public UUID getCompanyId() {
        return companyId;
    }

    public void setCompanyId(UUID companyId) {
        this.companyId = companyId;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public Integer getIsoWeek() {
        return isoWeek;
    }

    public void setIsoWeek(Integer isoWeek) {
        this.isoWeek = isoWeek;
    }

    public Integer getWeekBasedYear() {
        return weekBasedYear;
    }

    public void setWeekBasedYear(Integer weekBasedYear) {
        this.weekBasedYear = weekBasedYear;
    }
}
