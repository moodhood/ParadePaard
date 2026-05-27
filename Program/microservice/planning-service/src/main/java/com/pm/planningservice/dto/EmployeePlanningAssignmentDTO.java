package com.pm.planningservice.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class EmployeePlanningAssignmentDTO {
    private UUID scheduleEntryId;
    private UUID userId;
    private String userDisplayName;
    private UUID projectId;
    private String projectName;
    private String clientCompanyName;
    private LocalDate projectStartDate;
    private LocalDate projectEndDate;
    private String internalDescription;
    private String externalDescription;
    private String projectTimezone;
    private String projectLocation;
    private UUID shiftId;
    private String shiftName;
    private LocalDate shiftDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer breakMinutes;
    private String functionName;
    private String shiftLocation;
    private String status;
    private Boolean isPast;
    private Boolean timesheetExported;
    private LocalDateTime timesheetExportedAt;
    private TravelClaimSummaryDTO travelClaim;

    public UUID getScheduleEntryId() {
        return scheduleEntryId;
    }

    public void setScheduleEntryId(UUID scheduleEntryId) {
        this.scheduleEntryId = scheduleEntryId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUserDisplayName() {
        return userDisplayName;
    }

    public void setUserDisplayName(String userDisplayName) {
        this.userDisplayName = userDisplayName;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getClientCompanyName() {
        return clientCompanyName;
    }

    public void setClientCompanyName(String clientCompanyName) {
        this.clientCompanyName = clientCompanyName;
    }

    public LocalDate getProjectStartDate() {
        return projectStartDate;
    }

    public void setProjectStartDate(LocalDate projectStartDate) {
        this.projectStartDate = projectStartDate;
    }

    public LocalDate getProjectEndDate() {
        return projectEndDate;
    }

    public void setProjectEndDate(LocalDate projectEndDate) {
        this.projectEndDate = projectEndDate;
    }

    public String getInternalDescription() {
        return internalDescription;
    }

    public void setInternalDescription(String internalDescription) {
        this.internalDescription = internalDescription;
    }

    public String getExternalDescription() {
        return externalDescription;
    }

    public void setExternalDescription(String externalDescription) {
        this.externalDescription = externalDescription;
    }

    public String getProjectTimezone() {
        return projectTimezone;
    }

    public void setProjectTimezone(String projectTimezone) {
        this.projectTimezone = projectTimezone;
    }

    public String getProjectLocation() {
        return projectLocation;
    }

    public void setProjectLocation(String projectLocation) {
        this.projectLocation = projectLocation;
    }

    public UUID getShiftId() {
        return shiftId;
    }

    public void setShiftId(UUID shiftId) {
        this.shiftId = shiftId;
    }

    public String getShiftName() {
        return shiftName;
    }

    public void setShiftName(String shiftName) {
        this.shiftName = shiftName;
    }

    public LocalDate getShiftDate() {
        return shiftDate;
    }

    public void setShiftDate(LocalDate shiftDate) {
        this.shiftDate = shiftDate;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Integer getBreakMinutes() {
        return breakMinutes;
    }

    public void setBreakMinutes(Integer breakMinutes) {
        this.breakMinutes = breakMinutes;
    }

    public String getFunctionName() {
        return functionName;
    }

    public void setFunctionName(String functionName) {
        this.functionName = functionName;
    }

    public String getShiftLocation() {
        return shiftLocation;
    }

    public void setShiftLocation(String shiftLocation) {
        this.shiftLocation = shiftLocation;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsPast() {
        return isPast;
    }

    public void setIsPast(Boolean past) {
        isPast = past;
    }

    public Boolean getTimesheetExported() {
        return timesheetExported;
    }

    public void setTimesheetExported(Boolean timesheetExported) {
        this.timesheetExported = timesheetExported;
    }

    public LocalDateTime getTimesheetExportedAt() {
        return timesheetExportedAt;
    }

    public void setTimesheetExportedAt(LocalDateTime timesheetExportedAt) {
        this.timesheetExportedAt = timesheetExportedAt;
    }

    public TravelClaimSummaryDTO getTravelClaim() {
        return travelClaim;
    }

    public void setTravelClaim(TravelClaimSummaryDTO travelClaim) {
        this.travelClaim = travelClaim;
    }
}
