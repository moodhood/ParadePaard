package com.pm.userservice.dto;

import jakarta.validation.constraints.NotBlank;

public class UserSetupRequestDTO {
    @NotBlank
    private String street;

    @NotBlank
    private String houseNumber;

    private String houseNumberSuffix;

    @NotBlank
    private String postalCode;

    @NotBlank
    private String city;

    @NotBlank
    private String country;

    @NotBlank
    private String iban;

    @NotBlank
    private String bankAccountHolderName;

    @NotBlank
    private String bsn;

    private Boolean applyLoonheffingskorting;
    private Boolean pensionParticipant;
    private Boolean specialZvwContribution;
    private String payrollNotes;
    private String nationality;

    @NotBlank
    private String idDocumentType;

    @NotBlank
    private String idDocumentNumber;

    @NotBlank
    private String idIssueDate;

    @NotBlank
    private String idExpirationDate;

    @NotBlank
    private String idIssuingCountry;

    @NotBlank
    private String emergencyContactName;

    @NotBlank
    private String emergencyContactRelationship;

    @NotBlank
    private String emergencyContactPhone;

    private String emergencyContactEmail;

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getHouseNumber() {
        return houseNumber;
    }

    public void setHouseNumber(String houseNumber) {
        this.houseNumber = houseNumber;
    }

    public String getHouseNumberSuffix() {
        return houseNumberSuffix;
    }

    public void setHouseNumberSuffix(String houseNumberSuffix) {
        this.houseNumberSuffix = houseNumberSuffix;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
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

    public String getIban() {
        return iban;
    }

    public void setIban(String iban) {
        this.iban = iban;
    }

    public String getBankAccountHolderName() {
        return bankAccountHolderName;
    }

    public void setBankAccountHolderName(String bankAccountHolderName) {
        this.bankAccountHolderName = bankAccountHolderName;
    }

    public String getBsn() {
        return bsn;
    }

    public void setBsn(String bsn) {
        this.bsn = bsn;
    }

    public Boolean getApplyLoonheffingskorting() {
        return applyLoonheffingskorting;
    }

    public void setApplyLoonheffingskorting(Boolean applyLoonheffingskorting) {
        this.applyLoonheffingskorting = applyLoonheffingskorting;
    }

    public Boolean getPensionParticipant() {
        return pensionParticipant;
    }

    public void setPensionParticipant(Boolean pensionParticipant) {
        this.pensionParticipant = pensionParticipant;
    }

    public Boolean getSpecialZvwContribution() {
        return specialZvwContribution;
    }

    public void setSpecialZvwContribution(Boolean specialZvwContribution) {
        this.specialZvwContribution = specialZvwContribution;
    }

    public String getPayrollNotes() {
        return payrollNotes;
    }

    public void setPayrollNotes(String payrollNotes) {
        this.payrollNotes = payrollNotes;
    }

    public String getNationality() {
        return nationality;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public String getIdDocumentType() {
        return idDocumentType;
    }

    public void setIdDocumentType(String idDocumentType) {
        this.idDocumentType = idDocumentType;
    }

    public String getIdDocumentNumber() {
        return idDocumentNumber;
    }

    public void setIdDocumentNumber(String idDocumentNumber) {
        this.idDocumentNumber = idDocumentNumber;
    }

    public String getIdIssueDate() {
        return idIssueDate;
    }

    public void setIdIssueDate(String idIssueDate) {
        this.idIssueDate = idIssueDate;
    }

    public String getIdExpirationDate() {
        return idExpirationDate;
    }

    public void setIdExpirationDate(String idExpirationDate) {
        this.idExpirationDate = idExpirationDate;
    }

    public String getIdIssuingCountry() {
        return idIssuingCountry;
    }

    public void setIdIssuingCountry(String idIssuingCountry) {
        this.idIssuingCountry = idIssuingCountry;
    }

    public String getEmergencyContactName() {
        return emergencyContactName;
    }

    public void setEmergencyContactName(String emergencyContactName) {
        this.emergencyContactName = emergencyContactName;
    }

    public String getEmergencyContactRelationship() {
        return emergencyContactRelationship;
    }

    public void setEmergencyContactRelationship(String emergencyContactRelationship) {
        this.emergencyContactRelationship = emergencyContactRelationship;
    }

    public String getEmergencyContactPhone() {
        return emergencyContactPhone;
    }

    public void setEmergencyContactPhone(String emergencyContactPhone) {
        this.emergencyContactPhone = emergencyContactPhone;
    }

    public String getEmergencyContactEmail() {
        return emergencyContactEmail;
    }

    public void setEmergencyContactEmail(String emergencyContactEmail) {
        this.emergencyContactEmail = emergencyContactEmail;
    }
}
