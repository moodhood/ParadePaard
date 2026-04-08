package com.pm.planningservice.dto;

import com.pm.planningservice.model.ScheduleEntryStatus;
import jakarta.validation.constraints.NotNull;

public class EmployeeShiftResponseRequestDTO {
    @NotNull
    private ScheduleEntryStatus status;

    public ScheduleEntryStatus getStatus() {
        return status;
    }

    public void setStatus(ScheduleEntryStatus status) {
        this.status = status;
    }
}
