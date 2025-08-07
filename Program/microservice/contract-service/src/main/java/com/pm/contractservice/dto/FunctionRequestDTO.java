package com.pm.contractservice.dto;

import java.math.BigDecimal;

public class FunctionRequestDTO {
    private String functionName;
    private BigDecimal hourlyWage;

    public String getFunctionName() {
        return functionName;
    }

    public void setFunctionName(String functionName) {
        this.functionName = functionName;
    }

    public BigDecimal getHourlyWage() {
        return hourlyWage;
    }

    public void setHourlyWage(BigDecimal hourlyWage) {
        this.hourlyWage = hourlyWage;
    }
}
