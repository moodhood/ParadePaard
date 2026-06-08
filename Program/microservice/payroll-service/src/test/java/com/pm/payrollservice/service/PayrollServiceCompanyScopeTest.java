package com.pm.payrollservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pm.payrollservice.grpc.ContractServiceGrpcClient;
import com.pm.payrollservice.grpc.TimesheetServiceGrpcClient;
import com.pm.payrollservice.grpc.UserServiceGrpcClient;
import com.pm.payrollservice.model.Payslip;
import com.pm.payrollservice.model.PayslipStatus;
import com.pm.payrollservice.repository.PayslipRepository;
import com.pm.payrollservice.validation.PayslipValidator;
import org.junit.jupiter.api.Test;
import user.UserDataResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PayrollServiceCompanyScopeTest {

    @Test
    void getPayslipsReturnsOnlyPayslipsForTheRequestedCompany() {
        PayslipRepository payslipRepository = mock(PayslipRepository.class);
        PayslipValidator duplicateValidator = mock(PayslipValidator.class);
        UserServiceGrpcClient userServiceGrpcClient = mock(UserServiceGrpcClient.class);
        ContractServiceGrpcClient contractServiceGrpcClient = mock(ContractServiceGrpcClient.class);
        TimesheetServiceGrpcClient timesheetServiceGrpcClient = mock(TimesheetServiceGrpcClient.class);
        CompanySettingsClient companySettingsClient = mock(CompanySettingsClient.class);
        PayslipPdfService payslipPdfService = mock(PayslipPdfService.class);

        UUID companyId = UUID.randomUUID();
        UUID otherCompanyId = UUID.randomUUID();
        UUID companyUserId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();

        when(payslipRepository.findAll()).thenReturn(List.of(
                payslip(UUID.randomUUID(), companyUserId),
                payslip(UUID.randomUUID(), otherUserId)
        ));
        when(userServiceGrpcClient.requestUserData(companyUserId.toString()))
                .thenReturn(UserDataResponse.newBuilder().setCompanyId(companyId.toString()).build());
        when(userServiceGrpcClient.requestUserData(otherUserId.toString()))
                .thenReturn(UserDataResponse.newBuilder().setCompanyId(otherCompanyId.toString()).build());

        PayrollService payrollService = new PayrollService(
                payslipRepository,
                duplicateValidator,
                userServiceGrpcClient,
                contractServiceGrpcClient,
                timesheetServiceGrpcClient,
                companySettingsClient,
                payslipPdfService,
                new ObjectMapper(),
                new PayPeriodCalculator()
        );

        assertThat(payrollService.getPayslips(companyId))
                .singleElement()
                .satisfies(payslip -> assertThat(payslip.getUserId()).isEqualTo(companyUserId.toString()));
    }

    private static Payslip payslip(UUID payslipId, UUID userId) {
        Payslip payslip = new Payslip();
        payslip.setPayslipId(payslipId);
        payslip.setUserId(userId);
        payslip.setStatus(PayslipStatus.RELEASED);
        payslip.setDateOfIssue(LocalDate.of(2026, 5, 31));
        payslip.setHourlyWage(new BigDecimal("18.50"));
        payslip.setTotalHoursWorked(new BigDecimal("8.00"));
        payslip.setTravelExpenses(BigDecimal.ZERO);
        return payslip;
    }
}
