package com.pm.payrollservice.scheduler;

import com.pm.payrollservice.grpc.TimesheetServiceGrpcClient;
import com.pm.payrollservice.repository.PayslipRepository;
import com.pm.payrollservice.service.PayrollService;
import com.pm.payrollservice.service.PayslipReleaseService;
import com.pm.payrollservice.user.UserDirectoryClient;
import com.pm.payrollservice.user.UserDirectoryClient.UserRow;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import timesheet.LatestTimesheetSummaryResponse;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Component
public class PayslipScheduler {
    private static final Logger log = LoggerFactory.getLogger(PayslipScheduler.class);
    private static final int DEFAULT_PAYOUT_FREQUENCY_MINUTES = 10080;

    private final UserDirectoryClient userDirectoryClient;
    private final TimesheetServiceGrpcClient timesheetServiceGrpcClient;
    private final PayrollService payrollService;
    private final PayslipRepository payslipRepository;
    private final PayslipReleaseService payslipReleaseService;
    private final LocalTime payoutTime;
    private final ZoneId timeZone;
    private final Clock clock;

    public PayslipScheduler(
            UserDirectoryClient userDirectoryClient,
            TimesheetServiceGrpcClient timesheetServiceGrpcClient,
            PayrollService payrollService,
            PayslipRepository payslipRepository,
            PayslipReleaseService payslipReleaseService,
            @Value("${payslip.payout-time:12:00}") String payoutTime,
            @Value("${payslip.time-zone:Europe/Amsterdam}") String timeZone,
            @Nullable Clock clock
    ) {
        this.userDirectoryClient = userDirectoryClient;
        this.timesheetServiceGrpcClient = timesheetServiceGrpcClient;
        this.payrollService = payrollService;
        this.payslipRepository = payslipRepository;
        this.payslipReleaseService = payslipReleaseService;
        this.payoutTime = LocalTime.parse(payoutTime.trim());
        this.timeZone = ZoneId.of(timeZone.trim());
        this.clock = clock != null ? clock : Clock.systemUTC();
    }

    @Scheduled(initialDelay = 60_000, fixedDelay = 60_000)
    public void tick() {
        ZonedDateTime now = ZonedDateTime.ofInstant(clock.instant(), timeZone);

        try {
            payslipReleaseService.releaseDuePayslips(now, payoutTime);
        } catch (Exception e) {
            log.warn("Release sweep failed", e);
        }

        List<UserRow> users;
        try {
            users = userDirectoryClient.getAllUsers();
        } catch (Exception e) {
            log.warn("Could not fetch users for scheduling", e);
            return;
        }

        for (UserRow userRow : users) {
            UUID userId;
            try {
                userId = UUID.fromString(userRow.userId());
            } catch (Exception ignore) {
                continue;
            }

            if (!"ACTIVE".equalsIgnoreCase(userRow.status())) {
                continue;
            }

            int frequencyMinutes = userRow.payslipFrequencyMinutes() != null
                    ? userRow.payslipFrequencyMinutes()
                    : DEFAULT_PAYOUT_FREQUENCY_MINUTES;

            LatestTimesheetSummaryResponse latest;
            try {
                latest = timesheetServiceGrpcClient.requestLatestTimesheetSummary(userId.toString());
            } catch (StatusRuntimeException grpcErr) {
                if (grpcErr.getStatus().getCode() == Status.Code.NOT_FOUND) {
                    continue;
                }
                log.debug("Skipping scheduled payslip for userId={} (latest timesheet grpc error: {})",
                        userId, grpcErr.getStatus());
                continue;
            } catch (Exception e) {
                log.warn("Failed to resolve latest timesheet for userId={}", userId, e);
                continue;
            }

            int periodWeek;
            int periodYear;
            LocalDate periodEnd;
            ZonedDateTime dueAt;
            try {
                periodWeek = Integer.parseInt(latest.getWeekNumber());
                periodYear = Integer.parseInt(latest.getWeekBasedYear());
                periodEnd = LocalDate.parse(latest.getDateOfIssue());
                dueAt = resolveLoggedAt(latest).plusMinutes(frequencyMinutes);
            } catch (Exception parseErr) {
                log.warn("Skipping scheduled payslip for userId={} (invalid latest timesheet payload)", userId, parseErr);
                continue;
            }

            if (payslipRepository.existsByWeekBasedYearAndWeekNumberAndUserId(periodYear, periodWeek, userId)) {
                continue;
            }

            if (now.isBefore(dueAt)) {
                continue;
            }

            try {
                payrollService.createScheduledPayslip(userId, periodEnd, dueAt.toLocalDate());
            } catch (StatusRuntimeException grpcErr) {
                log.debug("Skipping scheduled payslip for userId={} (grpc error: {})", userId, grpcErr.getStatus());
            } catch (Exception e) {
                log.warn("Failed to create scheduled payslip for userId={}", userId, e);
            }
        }
    }

    private ZonedDateTime resolveLoggedAt(LatestTimesheetSummaryResponse latest) {
        if (!latest.getShiftEndTime().isBlank()) {
            return LocalDateTime.parse(latest.getShiftEndTime()).atZone(timeZone);
        }
        return LocalDate.parse(latest.getDateOfIssue()).atStartOfDay(timeZone);
    }
}
