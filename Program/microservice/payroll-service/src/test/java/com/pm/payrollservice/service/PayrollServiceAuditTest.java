package com.pm.payrollservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pm.payrollservice.dto.AuditLogCreateRequestDTO;
import com.pm.payrollservice.dto.PayslipRequestDTO;
import com.pm.payrollservice.grpc.ContractServiceGrpcClient;
import com.pm.payrollservice.grpc.TimesheetServiceGrpcClient;
import com.pm.payrollservice.grpc.UserServiceGrpcClient;
import com.pm.payrollservice.integration.AuditLogClient;
import com.pm.payrollservice.model.Payslip;
import com.pm.payrollservice.model.PayslipStatus;
import com.pm.payrollservice.repository.PayslipRepository;
import com.pm.payrollservice.validation.PayslipValidator;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PayrollServiceAuditTest {

    @Test
    void updatePayslipRecordsApprovalAuditEntry() throws Exception {
        PayslipRepository payslipRepository = mock(PayslipRepository.class);
        PayslipValidator duplicateValidator = mock(PayslipValidator.class);
        UserServiceGrpcClient userServiceGrpcClient = mock(UserServiceGrpcClient.class);
        ContractServiceGrpcClient contractServiceGrpcClient = mock(ContractServiceGrpcClient.class);
        TimesheetServiceGrpcClient timesheetServiceGrpcClient = mock(TimesheetServiceGrpcClient.class);
        CompanySettingsClient companySettingsClient = mock(CompanySettingsClient.class);
        PayslipPdfService payslipPdfService = mock(PayslipPdfService.class);
        AuditLogClient auditLogClient = mock(AuditLogClient.class);

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
        injectAuditLogClient(payrollService, auditLogClient);

        UUID payslipId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Payslip payslip = payslip(payslipId, userId, PayslipStatus.PENDING_REVIEW);
        when(payslipRepository.findById(payslipId)).thenReturn(Optional.of(payslip));
        when(payslipRepository.save(any(Payslip.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PayslipRequestDTO request = new PayslipRequestDTO();
        request.setStatus("APPROVED");

        payrollService.updatePayslip(payslipId, request, "access-token");

        verify(auditLogClient).record(eq("access-token"), argThat((AuditLogCreateRequestDTO auditRequest) ->
                auditRequest != null
                        && "PAYROLL".equals(auditRequest.getCategory())
                        && "APPROVED".equals(auditRequest.getAction())
                        && payslipId.toString().equals(auditRequest.getEntityId())
        ));
    }

    @Test
    void reportPayslipErrorRecordsAuditEntry() throws Exception {
        PayslipRepository payslipRepository = mock(PayslipRepository.class);
        PayslipValidator duplicateValidator = mock(PayslipValidator.class);
        UserServiceGrpcClient userServiceGrpcClient = mock(UserServiceGrpcClient.class);
        ContractServiceGrpcClient contractServiceGrpcClient = mock(ContractServiceGrpcClient.class);
        TimesheetServiceGrpcClient timesheetServiceGrpcClient = mock(TimesheetServiceGrpcClient.class);
        CompanySettingsClient companySettingsClient = mock(CompanySettingsClient.class);
        PayslipPdfService payslipPdfService = mock(PayslipPdfService.class);
        AuditLogClient auditLogClient = mock(AuditLogClient.class);

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
        injectAuditLogClient(payrollService, auditLogClient);

        UUID payslipId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Payslip payslip = payslip(payslipId, userId, PayslipStatus.RELEASED);
        when(payslipRepository.findById(payslipId)).thenReturn(Optional.of(payslip));
        when(payslipRepository.save(any(Payslip.class))).thenAnswer(invocation -> invocation.getArgument(0));

        payrollService.reportPayslipError(payslipId, "Wrong travel allowance", "access-token");

        verify(auditLogClient).record(eq("access-token"), argThat((AuditLogCreateRequestDTO auditRequest) ->
                auditRequest != null
                        && "PAYROLL".equals(auditRequest.getCategory())
                        && "REPORTED_ERROR".equals(auditRequest.getAction())
                        && payslipId.toString().equals(auditRequest.getEntityId())
        ));
    }

    private static void injectAuditLogClient(PayrollService payrollService, AuditLogClient auditLogClient) throws Exception {
        Field field = PayrollService.class.getDeclaredField("auditLogClient");
        field.setAccessible(true);
        field.set(payrollService, auditLogClient);
    }

    private static Payslip payslip(UUID payslipId, UUID userId, PayslipStatus status) {
        Payslip payslip = new Payslip();
        payslip.setPayslipId(payslipId);
        payslip.setUserId(userId);
        payslip.setStatus(status);
        payslip.setDateOfIssue(LocalDate.of(2026, 5, 31));
        payslip.setHourlyWage(new BigDecimal("18.50"));
        payslip.setTotalHoursWorked(new BigDecimal("8.00"));
        payslip.setTravelExpenses(BigDecimal.ZERO);
        return payslip;
    }
}
