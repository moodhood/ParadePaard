package com.pm.planningservice.dto;

import java.util.UUID;

public class PlanningProjectMutationResponseDTO {
    private UUID projectId;

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }
}
