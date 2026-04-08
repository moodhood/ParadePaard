package com.pm.planningservice.dto;

import com.pm.planningservice.model.TravelClaimStatus;
import jakarta.validation.constraints.NotNull;

public class TravelClaimReviewRequestDTO {
    @NotNull
    private TravelClaimStatus status;
    private String rejectionNote;

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
}
