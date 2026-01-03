package com.pm.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class AdminOnboardingRequestDTO {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String firstNames;

    private String preferredName;
    private String middleNamePrefix;

    @NotBlank
    private String lastName;

    private String gender;
    private String dateOfBirth;
    private String mobileNumber;

    @NotNull
    private Boolean workedForUsBefore;

    @NotBlank
    private String position;

    @NotBlank
    private String startDate;

    @NotBlank
    private String endDate;

    @NotBlank
    private String contractType;

    @NotNull
    private BigDecimal grossHourlyWage;

    @NotNull
    private Boolean travelAllowance;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstNames() {
        return firstNames;
    }

    public void setFirstNames(String firstNames) {
        this.firstNames = firstNames;
    }

    public String getPreferredName() {
        return preferredName;
    }

    public void setPreferredName(String preferredName) {
        this.preferredName = preferredName;
    }

    public String getMiddleNamePrefix() {
        return middleNamePrefix;
    }

    public void setMiddleNamePrefix(String middleNamePrefix) {
        this.middleNamePrefix = middleNamePrefix;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public Boolean getWorkedForUsBefore() {
        return workedForUsBefore;
    }

    public void setWorkedForUsBefore(Boolean workedForUsBefore) {
        this.workedForUsBefore = workedForUsBefore;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getContractType() {
        return contractType;
    }

    public void setContractType(String contractType) {
        this.contractType = contractType;
    }

    public BigDecimal getGrossHourlyWage() {
        return grossHourlyWage;
    }

    public void setGrossHourlyWage(BigDecimal grossHourlyWage) {
        this.grossHourlyWage = grossHourlyWage;
    }

    public Boolean getTravelAllowance() {
        return travelAllowance;
    }

    public void setTravelAllowance(Boolean travelAllowance) {
        this.travelAllowance = travelAllowance;
    }
}
