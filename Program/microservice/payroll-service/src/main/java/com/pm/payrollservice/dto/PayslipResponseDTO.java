// PayslipResponseDTO.java
package com.pm.payrollservice.dto;

import java.math.BigDecimal;

public class PayslipResponseDTO {
    private String payslipId;
    private String userId;
    private String dateOfIssue;
    private Integer weekNumber;
    private String name;
    private String address;
    private BigDecimal hoursWorked;
    private BigDecimal hourlyWage;
    private BigDecimal totalGrossAmount;
    private BigDecimal wageTaxWithheldTest;
    private BigDecimal totalNetAmount;

    public String getPayslipId() {
        return payslipId;
    }

    public void setPayslipId(String payslipId) {
        this.payslipId = payslipId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getDateOfIssue() {
        return dateOfIssue;
    }

    public void setDateOfIssue(String dateOfIssue) {
        this.dateOfIssue = dateOfIssue;
    }

    public Integer getWeekNumber() {
        return weekNumber;
    }

    public void setWeekNumber(Integer weekNumber) {
        this.weekNumber = weekNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public BigDecimal getHoursWorked() {
        return hoursWorked;
    }

    public void setHoursWorked(BigDecimal hoursWorked) {
        this.hoursWorked = hoursWorked;
    }

    public BigDecimal getHourlyWage() {
        return hourlyWage;
    }

    public void setHourlyWage(BigDecimal hourlyWage) {
        this.hourlyWage = hourlyWage;
    }

    public BigDecimal getTotalGrossAmount() {
        return totalGrossAmount;
    }

    public void setTotalGrossAmount(BigDecimal totalGrossAmount) {
        this.totalGrossAmount = totalGrossAmount;
    }

    public BigDecimal getWageTaxWithheldTest() {
        return wageTaxWithheldTest;
    }

    public void setWageTaxWithheldTest(BigDecimal wageTaxWithheldTest) {
        this.wageTaxWithheldTest = wageTaxWithheldTest;
    }

    public BigDecimal getTotalNetAmount() {
        return totalNetAmount;
    }

    public void setTotalNetAmount(BigDecimal totalNetAmount) {
        this.totalNetAmount = totalNetAmount;
    }
}
