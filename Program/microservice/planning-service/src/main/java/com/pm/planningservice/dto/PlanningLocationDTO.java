package com.pm.planningservice.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class PlanningLocationDTO {
    private UUID locationId;
    private String name;
    private String streetName;
    private String houseNumber;
    private String houseNumberSuffix;
    private String postalCode;
    private String city;
    private String notes;
    private List<UUID> prioritizedClientCompanyIds = new ArrayList<>();
    private Boolean preferredForClient;
    private LocalDateTime lastUsedAtForClient;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UUID getLocationId() {
        return locationId;
    }

    public void setLocationId(UUID locationId) {
        this.locationId = locationId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStreetName() {
        return streetName;
    }

    public void setStreetName(String streetName) {
        this.streetName = streetName;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<UUID> getPrioritizedClientCompanyIds() {
        return prioritizedClientCompanyIds;
    }

    public void setPrioritizedClientCompanyIds(List<UUID> prioritizedClientCompanyIds) {
        this.prioritizedClientCompanyIds = prioritizedClientCompanyIds == null
                ? new ArrayList<>()
                : new ArrayList<>(prioritizedClientCompanyIds);
    }

    public Boolean getPreferredForClient() {
        return preferredForClient;
    }

    public void setPreferredForClient(Boolean preferredForClient) {
        this.preferredForClient = preferredForClient;
    }

    public LocalDateTime getLastUsedAtForClient() {
        return lastUsedAtForClient;
    }

    public void setLastUsedAtForClient(LocalDateTime lastUsedAtForClient) {
        this.lastUsedAtForClient = lastUsedAtForClient;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
