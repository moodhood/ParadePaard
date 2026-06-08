package com.pm.planningservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "planning_client_location_usage", indexes = {
        @Index(name = "idx_planning_location_usage_client", columnList = "client_company_id"),
        @Index(name = "idx_planning_location_usage_location", columnList = "location_id"),
        @Index(name = "idx_planning_location_usage_client_location", columnList = "client_company_id,location_id", unique = true)
})
public class PlanningClientLocationUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private UUID usageId;

    @Column(nullable = false)
    private UUID clientCompanyId;

    @Column(nullable = false)
    private UUID locationId;

    @Column(nullable = false)
    private LocalDateTime lastUsedAt = LocalDateTime.now();

    public UUID getUsageId() {
        return usageId;
    }

    public void setUsageId(UUID usageId) {
        this.usageId = usageId;
    }

    public UUID getClientCompanyId() {
        return clientCompanyId;
    }

    public void setClientCompanyId(UUID clientCompanyId) {
        this.clientCompanyId = clientCompanyId;
    }

    public UUID getLocationId() {
        return locationId;
    }

    public void setLocationId(UUID locationId) {
        this.locationId = locationId;
    }

    public LocalDateTime getLastUsedAt() {
        return lastUsedAt;
    }

    public void setLastUsedAt(LocalDateTime lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }
}
