package com.pm.timesheetservice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class TimesheetRequestDTO {
    // Personal Details
    private String userId;
    private String name;

    // Date
    private String dateOfIssue;

    // Timesheet
    private String function;
    private BigDecimal hoursWorked;
    private BigDecimal travelExpenses;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDateOfIssue() {
        return dateOfIssue;
    }

    public void setDateOfIssue(String dateOfIssue) {
        this.dateOfIssue = dateOfIssue;
    }

    public String getFunction() {
        return function;
    }

    public void setFunction(String function) {
        this.function = function;
    }

    public BigDecimal getHoursWorked() {
        return hoursWorked;
    }

    public void setHoursWorked(BigDecimal hoursWorked) {
        this.hoursWorked = hoursWorked;
    }

    public BigDecimal getTravelExpenses() {
        return travelExpenses;
    }

    public void setTravelExpenses(BigDecimal travelExpenses) {
        this.travelExpenses = travelExpenses;
    }
}
