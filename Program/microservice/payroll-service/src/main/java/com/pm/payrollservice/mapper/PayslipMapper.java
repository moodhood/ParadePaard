package com.pm.payrollservice.mapper;

import com.pm.payrollservice.dto.PayslipRequestDTO;
import com.pm.payrollservice.dto.PayslipResponseDTO;
import com.pm.payrollservice.model.Payslip;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Predicate;

public class PayslipMapper {

    public static PayslipResponseDTO toDTO(Payslip payslip) {
        PayslipResponseDTO dto = new PayslipResponseDTO();

        dto.setName(payslip.getName());
        dto.setAddress(payslip.getAddress());
        dto.setTotalGrossAmount(payslip.getTotalGrossAmount());
        dto.setWageTaxWithheldTest(payslip.getWageTaxWithheldTest());
        dto.setTotalNetAmount(payslip.getTotalNetAmount());

        Optional.ofNullable(payslip.getPayslipId())
                .map(UUID::toString)
                .ifPresent(dto::setPayslipId);

        Optional.ofNullable(payslip.getUserId())
                .map(UUID::toString)
                .ifPresent(dto::setUserId);

        Optional.ofNullable(payslip.getDateOfIssue())
                .map(LocalDate::toString)
                .ifPresent(dto::setDateOfIssue);

        Optional.ofNullable(payslip.getHoursWorked())
                .ifPresent(dto::setHoursWorked);

        Optional.ofNullable(payslip.getHourlyWage())
                .ifPresent(dto::setHourlyWage);

        return dto;
    }

    public static Payslip toModel(PayslipRequestDTO dto) {
        Payslip payslip = new Payslip();

        Optional.ofNullable(dto.getUserId())
                .filter(Predicate.not(String::isBlank))
                .map(UUID::fromString)
                .ifPresent(payslip::setUserId);

        Optional.ofNullable(dto.getDateOfIssue())
                .filter(Predicate.not(String::isBlank))
                .map(LocalDate::parse)
                .ifPresent(payslip::setDateOfIssue);

        Optional.ofNullable(dto.getHoursWorked())
                .ifPresent(payslip::setHoursWorked);

        Optional.ofNullable(dto.getHourlyWage())
                .ifPresent(payslip::setHourlyWage);

        return payslip;
    }
}