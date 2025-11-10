// src/main/java/com/pm/userservice/dto/LeaveDecisionDTO.java
package com.pm.userservice.dto;

import jakarta.validation.constraints.Size;

public class LeaveDecisionDTO {
    @Size(max = 1000)
    private String reason;

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
