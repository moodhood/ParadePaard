package com.pm.planningservice.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class FinalizePlanningResponseDTO {
    private Integer createdTimesheets;
    private List<UUID> finalizedProjectIds = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();

    public Integer getCreatedTimesheets() {
        return createdTimesheets;
    }

    public void setCreatedTimesheets(Integer createdTimesheets) {
        this.createdTimesheets = createdTimesheets;
    }

    public List<UUID> getFinalizedProjectIds() {
        return finalizedProjectIds;
    }

    public void setFinalizedProjectIds(List<UUID> finalizedProjectIds) {
        this.finalizedProjectIds = finalizedProjectIds;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }
}
