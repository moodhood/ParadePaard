package com.pm.planningservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "projects", indexes = {
        @Index(name = "idx_project_company", columnList = "company_id"),
        @Index(name = "idx_project_date_range", columnList = "start_date,end_date"),
        @Index(name = "idx_project_company_date_range", columnList = "company_id,start_date,end_date")
})
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private UUID projectId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private UUID companyId;

    @Column(name = "client_company_id")
    private UUID clientCompanyId;

    @Column(length = 2000)
    private String internalDescription;

    @Column(length = 4000)
    private String externalDescription;

    private LocalTime defaultStartTime;

    private LocalTime defaultEndTime;

    @Column(length = 100)
    private String projectTimezone = "UTC";

    private String location;

    @Column(length = 20)
    private String status = "DRAFT";

    private UUID createdByUserId;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(nullable = false)
    private Boolean finalized = false;

    private LocalDateTime finalizedAt;

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public UUID getCompanyId() {
        return companyId;
    }

    public void setCompanyId(UUID companyId) {
        this.companyId = companyId;
    }

    public UUID getClientCompanyId() {
        return clientCompanyId;
    }

    public void setClientCompanyId(UUID clientCompanyId) {
        this.clientCompanyId = clientCompanyId;
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

    public LocalTime getDefaultStartTime() {
        return defaultStartTime;
    }

    public void setDefaultStartTime(LocalTime defaultStartTime) {
        this.defaultStartTime = defaultStartTime;
    }

    public LocalTime getDefaultEndTime() {
        return defaultEndTime;
    }

    public void setDefaultEndTime(LocalTime defaultEndTime) {
        this.defaultEndTime = defaultEndTime;
    }

    public String getProjectTimezone() {
        return projectTimezone;
    }

    public void setProjectTimezone(String projectTimezone) {
        this.projectTimezone = projectTimezone;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public UUID getCreatedByUserId() {
        return createdByUserId;
    }

    public void setCreatedByUserId(UUID createdByUserId) {
        this.createdByUserId = createdByUserId;
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

    public Boolean getFinalized() {
        return finalized;
    }

    public void setFinalized(Boolean finalized) {
        this.finalized = finalized;
    }

    public LocalDateTime getFinalizedAt() {
        return finalizedAt;
    }

    public void setFinalizedAt(LocalDateTime finalizedAt) {
        this.finalizedAt = finalizedAt;
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (status == null || status.isBlank()) {
            status = "DRAFT";
        }
        if (projectTimezone == null || projectTimezone.isBlank()) {
            projectTimezone = "UTC";
        }
        if (finalized == null) {
            finalized = false;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
        if (status == null || status.isBlank()) {
            status = "DRAFT";
        }
        if (projectTimezone == null || projectTimezone.isBlank()) {
            projectTimezone = "UTC";
        }
    }
}
