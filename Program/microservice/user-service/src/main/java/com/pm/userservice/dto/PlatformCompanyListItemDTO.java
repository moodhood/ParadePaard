package com.pm.userservice.dto;

public class PlatformCompanyListItemDTO {
    private String companyId;
    private String name;
    private Integer payoutFrequencyMinutes;
    private String timesheetLoggingMode;
    private String travelClaimMode;
    private int totalUsers;
    private int activeUsers;
    private int pendingOnboardingReview;

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getPayoutFrequencyMinutes() {
        return payoutFrequencyMinutes;
    }

    public void setPayoutFrequencyMinutes(Integer payoutFrequencyMinutes) {
        this.payoutFrequencyMinutes = payoutFrequencyMinutes;
    }

    public String getTimesheetLoggingMode() {
        return timesheetLoggingMode;
    }

    public void setTimesheetLoggingMode(String timesheetLoggingMode) {
        this.timesheetLoggingMode = timesheetLoggingMode;
    }

    public String getTravelClaimMode() {
        return travelClaimMode;
    }

    public void setTravelClaimMode(String travelClaimMode) {
        this.travelClaimMode = travelClaimMode;
    }

    public int getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(int totalUsers) {
        this.totalUsers = totalUsers;
    }

    public int getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(int activeUsers) {
        this.activeUsers = activeUsers;
    }

    public int getPendingOnboardingReview() {
        return pendingOnboardingReview;
    }

    public void setPendingOnboardingReview(int pendingOnboardingReview) {
        this.pendingOnboardingReview = pendingOnboardingReview;
    }
}
