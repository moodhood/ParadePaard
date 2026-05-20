package com.pm.userservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "cao_templates",
        uniqueConstraints = {
                @UniqueConstraint(name = "cao_templates_company_name_key", columnNames = {"company_id", "name"})
        }
)
public class CaoTemplate {
    @Id
    private UUID caoId;

    @Column(nullable = false)
    private UUID companyId;

    @Column(nullable = false)
    private String name;

    private String sector;

    private LocalDate effectiveFrom;

    private LocalDate effectiveUntil;

    @Column(columnDefinition = "TEXT")
    private String variablesJson;

    public UUID getCaoId() { return caoId; }
    public void setCaoId(UUID caoId) { this.caoId = caoId; }
    public UUID getCompanyId() { return companyId; }
    public void setCompanyId(UUID companyId) { this.companyId = companyId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public LocalDate getEffectiveUntil() { return effectiveUntil; }
    public void setEffectiveUntil(LocalDate effectiveUntil) { this.effectiveUntil = effectiveUntil; }
    public String getVariablesJson() { return variablesJson; }
    public void setVariablesJson(String variablesJson) { this.variablesJson = variablesJson; }
}
