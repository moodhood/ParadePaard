package com.pm.contractservice.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class FunctionResponseDTO {
    public UUID getFunctionId() {
        return functionId;
    }

    public void setFunctionId(UUID functionId) {
        this.functionId = functionId;
    }

    public String getFunctionName() {
        return functionName;
    }

    public void setFunctionName(String functionName) {
        this.functionName = functionName;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    private UUID functionId;

    private String functionName;
    private BigDecimal hourlyRate;
}

