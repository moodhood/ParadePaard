package com.pm.planningservice.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class EmployeePlanningAssignmentDTO {
    private UUID scheduleEntryId;
    private UUID userId;
    private String userDisplayName;
    private UUID eventId;
    private String eventName;
    private String clientCompanyName;
    private LocalDate eventStartDate;
    private LocalDate eventEndDate;
    private String internalDescription;
    private String externalDescription;
    private String eventLocation;
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

    public UUID getEventId() {
        return eventId;
    }

    public void setEventId(UUID eventId) {
        this.eventId = eventId;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getClientCompanyName() {
        return clientCompanyName;
    }

    public void setClientCompanyName(String clientCompanyName) {
        this.clientCompanyName = clientCompanyName;
    }

    public LocalDate getEventStartDate() {
        return eventStartDate;
    }

    public void setEventStartDate(LocalDate eventStartDate) {
        this.eventStartDate = eventStartDate;
    }

    public LocalDate getEventEndDate() {
        return eventEndDate;
    }

    public void setEventEndDate(LocalDate eventEndDate) {
        this.eventEndDate = eventEndDate;
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

    public String getEventLocation() {
        return eventLocation;
    }

    public void setEventLocation(String eventLocation) {
        this.eventLocation = eventLocation;
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
