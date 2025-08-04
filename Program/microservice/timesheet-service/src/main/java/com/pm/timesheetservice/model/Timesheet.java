package com.pm.timesheetservice.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "timesheets")
public class Timesheet {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private UUID timesheetId;
    private UUID userId;
    private String name;

    // Date
    @Column(nullable = false)
    private LocalDate dateOfIssue;
    private Integer weekNumber;
    private Integer weekBasedYear;

    // Timesheet
    private String function;
    @Column(precision = 19, scale = 2)
    private BigDecimal hoursWorked;
    @Column(precision = 19, scale = 2)
    private BigDecimal travelExpenses;

    public UUID getTimesheetId() {
        return timesheetId;
    }

    public void setTimesheetId(UUID timesheetId) {
        this.timesheetId = timesheetId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getDateOfIssue() {
        return dateOfIssue;
    }

    public void setDateOfIssue(LocalDate dateOfIssue) {
        this.dateOfIssue = dateOfIssue;
    }

    public Integer getWeekNumber() {
        return weekNumber;
    }

    public void setWeekNumber(Integer weekNumber) {
        this.weekNumber = weekNumber;
    }

    public Integer getWeekBasedYear() {
        return weekBasedYear;
    }

    public void setWeekBasedYear(Integer weekBasedYear) {
        this.weekBasedYear = weekBasedYear;
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
