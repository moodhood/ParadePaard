package com.pm.planningservice.dto;

import java.util.UUID;

public class PlanningShiftMutationResponseDTO {
    private UUID shiftId;
    private UUID projectId;

    public UUID getShiftId() {
        return shiftId;
    }

    public void setShiftId(UUID shiftId) {
        this.shiftId = shiftId;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }
}
