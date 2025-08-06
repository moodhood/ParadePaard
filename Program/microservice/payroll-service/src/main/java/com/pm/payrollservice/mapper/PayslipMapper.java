package com.pm.payrollservice.mapper;

import com.pm.payrollservice.dto.PayslipRequestDTO;
import com.pm.payrollservice.dto.PayslipResponseDTO;
import com.pm.payrollservice.model.Payslip;
import user.UserDataResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Predicate;

public class PayslipMapper {

    public static PayslipResponseDTO toDTO(Payslip payslip) {
        PayslipResponseDTO payslipResponseDTO = new PayslipResponseDTO();
        payslipResponseDTO.setPayslipId(payslip.getPayslipId().toString());

        // Date
        payslipResponseDTO.setDateOfIssue(payslip.getDateOfIssue().toString());
        payslipResponseDTO.setWeekNumber(payslip.getWeekNumber());
        payslipResponseDTO.setWeekBasedYear(payslip.getWeekBasedYear());

        // Payslip Details
        payslipResponseDTO.setHoursWorked(payslip.getHoursWorked());
        payslipResponseDTO.setHourlyWage(payslip.getHourlyWage());
        payslipResponseDTO.setTotalGrossAmount(payslip.getTotalGrossAmount());
        payslipResponseDTO.setWageTaxWithheldTest(payslip.getWageTaxWithheldTest()); // TODO tax withheld is just a test
        payslipResponseDTO.setTotalNetAmount(payslip.getTotalNetAmount());

        // Personal Details
        payslipResponseDTO.setUserId(payslip.getUserId().toString());
        payslipResponseDTO.setName(payslip.getName());
        payslipResponseDTO.getDateOfBirth(payslip.getDateOfBirth());
        payslipResponseDTO.setStreetName(payslip.getStreetName());
        payslipResponseDTO.setHouseNumber(payslip.getHouseNumber());
        payslipResponseDTO.setHouseNumberSuffix(payslip.getHouseNumberSuffix());
        payslipResponseDTO.setPostalCode(payslip.getPostalCode());
        payslipResponseDTO.setCity(payslip.getCity());
        payslipResponseDTO.setCountry(payslip.getCountry());
        return payslipResponseDTO;
    }

    public static Payslip toModel(PayslipRequestDTO payslipRequestDTO) {
        Payslip payslip = new Payslip();

        payslip.setUserId(UUID.fromString(payslipRequestDTO.getUserId()));
        payslip.setDateOfIssue(LocalDate.parse(payslipRequestDTO.getDateOfIssue()));
        payslip.setHoursWorked(payslipRequestDTO.getHoursWorked());
        payslip.setHourlyWage(payslipRequestDTO.getHourlyWage());

        return payslip;
    }

    public static void updateFromUserData(Payslip payslip, UserDataResponse userData) {
        payslip.setName(userData.getName());
        payslip.setDateOfBirth(LocalDate.parse(userData.getDateOfBirth()));
        payslip.setStreetName(userData.getStreetName());
        payslip.setHouseNumber(userData.getHouseNumber());
        payslip.setHouseNumberSuffix(userData.getHouseNumberSuffix());
        payslip.setPostalCode(userData.getPostalCode());
        payslip.setCity(userData.getCity());
        payslip.setCountry(userData.getCountry());
    }



}