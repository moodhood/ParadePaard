package com.pm.payrollservice.scheduler;

import com.pm.payrollservice.grpc.TimesheetServiceGrpcClient;
import com.pm.payrollservice.repository.PayslipRepository;
import com.pm.payrollservice.service.PayrollService;
import com.pm.payrollservice.service.PayslipReleaseService;
import com.pm.payrollservice.user.UserDirectoryClient;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PayslipSchedulerTest {

    @Test
    void createsScheduledPayslipWhenLatestLoggedShiftIsPastCadence() {
        UserDirectoryClient userDirectoryClient = mock(UserDirectoryClient.class);
        TimesheetServiceGrpcClient timesheetServiceGrpcClient = mock(TimesheetServiceGrpcClient.class);
        PayrollService payrollService = mock(PayrollService.class);
        PayslipRepository payslipRepository = mock(PayslipRepository.class);
        PayslipReleaseService payslipReleaseService = mock(PayslipReleaseService.class);

        UUID userId = UUID.randomUUID();
        when(userDirectoryClient.getAllUsers())
                .thenReturn(List.of(new UserDirectoryClient.UserRow(userId.toString(), 5, "ACTIVE")));
        when(timesheetServiceGrpcClient.requestLatestTimesheetSummary(userId.toString()))
                .thenReturn(timesheet.LatestTimesheetSummaryResponse.newBuilder()
                        .setTimesheetId(UUID.randomUUID().toString())
                        .setDateOfIssue("2026-04-13")
                        .setWeekNumber("16")
                        .setWeekBasedYear("2026")
                        .setShiftEndTime("2026-04-13T10:00:00")
                        .build());
        when(payslipRepository.existsByWeekBasedYearAndWeekNumberAndUserId(2026, 16, userId))
                .thenReturn(false);

        Clock clock = Clock.fixed(Instant.parse("2026-04-13T08:10:00Z"), ZoneOffset.UTC);
        PayslipScheduler scheduler = new PayslipScheduler(
                userDirectoryClient,
                timesheetServiceGrpcClient,
                payrollService,
                payslipRepository,
                payslipReleaseService,
                "12:00",
                "Europe/Amsterdam",
                clock
        );

        scheduler.tick();

        verify(payslipReleaseService).releaseDuePayslips(
                eq(ZonedDateTime.parse("2026-04-13T10:10:00+02:00[Europe/Amsterdam]")),
                eq(java.time.LocalTime.parse("12:00"))
        );
        verify(payrollService).createScheduledPayslip(
                eq(userId),
                eq(LocalDate.parse("2026-04-13")),
                eq(LocalDate.parse("2026-04-13"))
        );
    }

    @Test
    void skipsScheduledPayslipBeforeCadenceHasElapsed() {
        UserDirectoryClient userDirectoryClient = mock(UserDirectoryClient.class);
        TimesheetServiceGrpcClient timesheetServiceGrpcClient = mock(TimesheetServiceGrpcClient.class);
        PayrollService payrollService = mock(PayrollService.class);
        PayslipRepository payslipRepository = mock(PayslipRepository.class);
        PayslipReleaseService payslipReleaseService = mock(PayslipReleaseService.class);

        UUID userId = UUID.randomUUID();
        when(userDirectoryClient.getAllUsers())
                .thenReturn(List.of(new UserDirectoryClient.UserRow(userId.toString(), 5, "ACTIVE")));
        when(timesheetServiceGrpcClient.requestLatestTimesheetSummary(userId.toString()))
                .thenReturn(timesheet.LatestTimesheetSummaryResponse.newBuilder()
                        .setTimesheetId(UUID.randomUUID().toString())
                        .setDateOfIssue("2026-04-13")
                        .setWeekNumber("16")
                        .setWeekBasedYear("2026")
                        .setShiftEndTime("2026-04-13T10:07:00")
                        .build());
        when(payslipRepository.existsByWeekBasedYearAndWeekNumberAndUserId(2026, 16, userId))
                .thenReturn(false);

        Clock clock = Clock.fixed(Instant.parse("2026-04-13T08:10:00Z"), ZoneOffset.UTC);
        PayslipScheduler scheduler = new PayslipScheduler(
                userDirectoryClient,
                timesheetServiceGrpcClient,
                payrollService,
                payslipRepository,
                payslipReleaseService,
                "12:00",
                "Europe/Amsterdam",
                clock
        );

        scheduler.tick();

        verify(payrollService, never()).createScheduledPayslip(any(), any(), any());
    }
}
