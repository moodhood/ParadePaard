package com.pm.planningservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TravelClaimSummaryDTO {
    private BigDecimal kilometers;
    private BigDecimal ratePerKilometer;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String rejectionNote;
    private Boolean hasProof;

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public String getRejectionNote() {
        return rejectionNote;
    }

    public void setRejectionNote(String rejectionNote) {
        this.rejectionNote = rejectionNote;
    }

    public Boolean getHasProof() {
        return hasProof;
    }

    public void setHasProof(Boolean hasProof) {
        this.hasProof = hasProof;
    }
}
