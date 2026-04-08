package com.pm.planningservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class TravelClaimSaveRequestDTO {
    @NotNull
    @DecimalMin(value = "0.00")
    private BigDecimal kilometers;

    public BigDecimal getKilometers() {
        return kilometers;
    }

    public void setKilometers(BigDecimal kilometers) {
        this.kilometers = kilometers;
    }
}
