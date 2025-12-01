// src/main/java/com/pm/userservice/dto/LeaveRequestCreateDTO.java
package com.pm.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public class LeaveRequestCreateDTO {

    @NotBlank(message = "type is required")
    private String type;

    @NotBlank(message = "startDate is required")
    @Pattern(regexp = "^\\d{4}\\-\\d{2}\\-\\d{2}$", message = "startDate must be ISO yyyy MM dd")
    private String startDate;

    @NotBlank(message = "endDate is required")
    @Pattern(regexp = "^\\d{4}\\-\\d{2}\\-\\d{2}$", message = "endDate must be ISO yyyy MM dd")
    private String endDate;

    @Positive(message = "hours must be positive")
    private Integer hours;

    private String reason;

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
}
