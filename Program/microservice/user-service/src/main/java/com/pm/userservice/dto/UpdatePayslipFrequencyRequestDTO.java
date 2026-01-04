package com.pm.userservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdatePayslipFrequencyRequestDTO {
    @NotNull
    @Min(1)
    @Max(525600)
    private Integer payslipFrequencyMinutes;

    public Integer getPayslipFrequencyMinutes() {
        return payslipFrequencyMinutes;
    }

    public void setPayslipFrequencyMinutes(Integer payslipFrequencyMinutes) {
        this.payslipFrequencyMinutes = payslipFrequencyMinutes;
    }
}

