package com.pm.userservice.dto;

import jakarta.validation.constraints.NotBlank;

public class OnboardingReviewUpdateDTO {
    @NotBlank
    private String decision;

    private String note;

    private String status;

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

