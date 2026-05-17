package com.pm.userservice.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class JobApplicationRequestDTO {
    @NotBlank private String firstNames;
    private String preferredName;
    private String middleNamePrefix;
    @NotBlank private String lastName;
    @Email @NotBlank private String email;
    @NotBlank private String phoneNumber;
    @NotBlank private String dateOfBirth;
    private String gender;
    private String nationality;
    private String city;
    private String country;
    @NotBlank private String roleInterest;
    @NotBlank private String contractPreference;
    private String availableFrom;
    private String note;
    @NotNull private Boolean workedForUsBefore;
    @AssertTrue private boolean contactConsent;
    @AssertTrue private boolean informationAccurate;

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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getNationality() {
        return nationality;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getRoleInterest() {
        return roleInterest;
    }

    public void setRoleInterest(String roleInterest) {
        this.roleInterest = roleInterest;
    }

    public String getContractPreference() {
        return contractPreference;
    }

    public void setContractPreference(String contractPreference) {
        this.contractPreference = contractPreference;
    }

    public String getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(String availableFrom) {
        this.availableFrom = availableFrom;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Boolean getWorkedForUsBefore() {
        return workedForUsBefore;
    }

    public void setWorkedForUsBefore(Boolean workedForUsBefore) {
        this.workedForUsBefore = workedForUsBefore;
    }

    public boolean isContactConsent() {
        return contactConsent;
    }

    public void setContactConsent(boolean contactConsent) {
        this.contactConsent = contactConsent;
    }

    public boolean isInformationAccurate() {
        return informationAccurate;
    }

    public void setInformationAccurate(boolean informationAccurate) {
        this.informationAccurate = informationAccurate;
    }
}
