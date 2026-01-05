package com.pm.payrollservice.dto;

import jakarta.validation.constraints.NotBlank;

public class PayslipErrorReportDTO {
    @NotBlank(message = "errorDescription is required")
    private String errorDescription;

    public String getErrorDescription() {
        return errorDescription;
    }

    public void setErrorDescription(String errorDescription) {
        this.errorDescription = errorDescription;
    }
}
