// src/main/java/com/pm/userservice/dto/LeaveRequestUpdateDTO.java
package com.pm.userservice.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public class LeaveRequestUpdateDTO {

    // all optional for partial edits
    private String type; // enum name

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "startDate must be ISO yyyy-MM-dd")
    private String startDate;

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "endDate must be ISO yyyy-MM-dd")
    private String endDate;

    @Positive
    private Integer hours;

    private String reason;

    private String status; // PENDING, APPROVED, REJECTED, CANCELED

    // getters and setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public Integer getHours() { return hours; }
    public void setHours(Integer hours) { this.hours = hours; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
