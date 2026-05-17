package com.pm.userservice.mapper;

import com.pm.userservice.dto.JobApplicationRequestDTO;
import com.pm.userservice.dto.JobApplicationResponseDTO;
import com.pm.userservice.model.ApplicationStatus;
import com.pm.userservice.model.JobApplication;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public final class JobApplicationMapper {
    private static final DateTimeFormatter D = DateTimeFormatter.ISO_DATE;

    private JobApplicationMapper() {}

    public static JobApplication toNewEntity(JobApplicationRequestDTO dto) {
        JobApplication application = new JobApplication();
        application.setFirstNames(dto.getFirstNames());
        application.setPreferredName(dto.getPreferredName());
        application.setMiddleNamePrefix(dto.getMiddleNamePrefix());
        application.setLastName(dto.getLastName());
        application.setEmail(dto.getEmail());
        application.setPhoneNumber(dto.getPhoneNumber());
        application.setDateOfBirth(LocalDate.parse(dto.getDateOfBirth(), D));
        application.setGender(dto.getGender());
        application.setNationality(dto.getNationality());
        application.setCity(dto.getCity());
        application.setCountry(dto.getCountry());
        application.setRoleInterest(dto.getRoleInterest());
        application.setContractPreference(dto.getContractPreference());
        application.setAvailableFrom(parseDate(dto.getAvailableFrom()));
        application.setAvailabilityNotes(dto.getAvailabilityNotes());
        application.setWorkedForUsBefore(Boolean.TRUE.equals(dto.getWorkedForUsBefore()));
        application.setExperience(dto.getExperience());
        application.setLanguages(dto.getLanguages());
        application.setCertificates(dto.getCertificates());
        application.setMotivation(dto.getMotivation());
        application.setContactConsent(dto.isContactConsent());
        application.setInformationAccurate(dto.isInformationAccurate());
        application.setStatus(ApplicationStatus.APPLICATION_SUBMITTED);
        return application;
    }

    public static JobApplicationResponseDTO toDTO(JobApplication application) {
        JobApplicationResponseDTO dto = new JobApplicationResponseDTO();
        dto.setApplicationId(toString(application.getApplicationId()));
        dto.setFirstNames(application.getFirstNames());
        dto.setPreferredName(application.getPreferredName());
        dto.setMiddleNamePrefix(application.getMiddleNamePrefix());
        dto.setLastName(application.getLastName());
        dto.setEmail(application.getEmail());
        dto.setPhoneNumber(application.getPhoneNumber());
        dto.setDateOfBirth(toString(application.getDateOfBirth()));
        dto.setGender(application.getGender());
        dto.setNationality(application.getNationality());
        dto.setCity(application.getCity());
        dto.setCountry(application.getCountry());
        dto.setRoleInterest(application.getRoleInterest());
        dto.setContractPreference(application.getContractPreference());
        dto.setAvailableFrom(toString(application.getAvailableFrom()));
        dto.setAvailabilityNotes(application.getAvailabilityNotes());
        dto.setWorkedForUsBefore(application.isWorkedForUsBefore());
        dto.setExperience(application.getExperience());
        dto.setLanguages(application.getLanguages());
        dto.setCertificates(application.getCertificates());
        dto.setMotivation(application.getMotivation());
        dto.setContactConsent(application.isContactConsent());
        dto.setInformationAccurate(application.isInformationAccurate());
        dto.setCvFileName(application.getCvFileName());
        dto.setCvContentType(application.getCvContentType());
        dto.setStatus(application.getStatus().name());
        dto.setReviewNote(application.getReviewNote());
        dto.setReviewedAt(toString(application.getReviewedAt()));
        dto.setReviewedByUserId(application.getReviewedByUserId());
        dto.setDecisionEmailSent(application.getDecisionEmailSent());
        dto.setAcceptedUserId(toString(application.getAcceptedUserId()));
        dto.setSubmittedAt(toString(application.getSubmittedAt()));
        dto.setUpdatedAt(toString(application.getUpdatedAt()));
        return dto;
    }

    private static LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return LocalDate.parse(value, D);
    }

    private static String toString(LocalDate value) {
        return value == null ? null : value.toString();
    }

    private static String toString(OffsetDateTime value) {
        return value == null ? null : value.toString();
    }

    private static String toString(UUID value) {
        return value == null ? null : value.toString();
    }
}
