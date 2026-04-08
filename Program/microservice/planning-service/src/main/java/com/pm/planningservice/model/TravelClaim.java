package com.pm.planningservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "travel_claims",
        indexes = {
                @Index(name = "idx_travel_claim_schedule_entry", columnList = "schedule_entry_id"),
                @Index(name = "idx_travel_claim_status", columnList = "status")
        },
        uniqueConstraints = @UniqueConstraint(columnNames = "schedule_entry_id")
)
public class TravelClaim {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private UUID travelClaimId;

    @Column(nullable = false)
    private UUID scheduleEntryId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal kilometers;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal ratePerKilometer;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TravelClaimStatus status;

    @Column(length = 2000)
    private String rejectionNote;

    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private UUID reviewedByUserId;

    @Column(name = "proof_image")
    private byte[] proofImage;

    @Column(name = "proof_content_type")
    private String proofContentType;

    public UUID getTravelClaimId() {
        return travelClaimId;
    }

    public void setTravelClaimId(UUID travelClaimId) {
        this.travelClaimId = travelClaimId;
    }

    public UUID getScheduleEntryId() {
        return scheduleEntryId;
    }

    public void setScheduleEntryId(UUID scheduleEntryId) {
        this.scheduleEntryId = scheduleEntryId;
    }

    public BigDecimal getKilometers() {
        return kilometers;
    }

    public void setKilometers(BigDecimal kilometers) {
        this.kilometers = kilometers;
    }

    public BigDecimal getRatePerKilometer() {
        return ratePerKilometer;
    }

    public void setRatePerKilometer(BigDecimal ratePerKilometer) {
        this.ratePerKilometer = ratePerKilometer;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public TravelClaimStatus getStatus() {
        return status;
    }

    public void setStatus(TravelClaimStatus status) {
        this.status = status;
    }

    public String getRejectionNote() {
        return rejectionNote;
    }

    public void setRejectionNote(String rejectionNote) {
        this.rejectionNote = rejectionNote;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public UUID getReviewedByUserId() {
        return reviewedByUserId;
    }

    public void setReviewedByUserId(UUID reviewedByUserId) {
        this.reviewedByUserId = reviewedByUserId;
    }

    public byte[] getProofImage() {
        return proofImage;
    }

    public void setProofImage(byte[] proofImage) {
        this.proofImage = proofImage;
    }

    public String getProofContentType() {
        return proofContentType;
    }

    public void setProofContentType(String proofContentType) {
        this.proofContentType = proofContentType;
    }
}
