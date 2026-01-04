package com.pm.payrollservice.scheduler;

import com.pm.payrollservice.model.PayslipStatus;
import com.pm.payrollservice.repository.PayslipRepository;
import com.pm.payrollservice.service.PayrollService;
import com.pm.payrollservice.service.PayslipReleaseService;
import com.pm.payrollservice.user.UserDirectoryClient;
import com.pm.payrollservice.user.UserDirectoryClient.UserRow;
import io.grpc.StatusRuntimeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.UUID;

@Component
public class PayslipScheduler {
    private static final Logger log = LoggerFactory.getLogger(PayslipScheduler.class);

    private final UserDirectoryClient userDirectoryClient;
    private final PayrollService payrollService;
    private final PayslipRepository payslipRepository;
    private final PayslipReleaseService payslipReleaseService;

    private final DayOfWeek payoutDay;
    private final int reviewLeadDays;
    private final LocalTime payoutTime;
    private final ZoneId timeZone;

    public PayslipScheduler(
            UserDirectoryClient userDirectoryClient,
            PayrollService payrollService,
            PayslipRepository payslipRepository,
            PayslipReleaseService payslipReleaseService,
            @Value("${payslip.payout-day:SUNDAY}") String payoutDay,
            @Value("${payslip.payout-time:12:00}") String payoutTime,
            @Value("${payslip.time-zone:Europe/Amsterdam}") String timeZone,
            @Value("${payslip.review-lead-days:2}") int reviewLeadDays
    ) {
        this.userDirectoryClient = userDirectoryClient;
        this.payrollService = payrollService;
        this.payslipRepository = payslipRepository;
        this.payslipReleaseService = payslipReleaseService;
        this.payoutDay = DayOfWeek.valueOf(payoutDay.trim().toUpperCase());
        this.payoutTime = LocalTime.parse(payoutTime.trim());
        this.timeZone = ZoneId.of(timeZone.trim());
        this.reviewLeadDays = reviewLeadDays;
    }

    @Scheduled(initialDelay = 60_000, fixedDelay = 60_000)
    public void tick() {
        ZonedDateTime now = ZonedDateTime.now(timeZone);
        LocalDate today = now.toLocalDate();

        try {
            payslipReleaseService.releaseDuePayslips(now, payoutTime);
        } catch (Exception e) {
            log.warn("Release sweep failed", e);
        }

        LocalDate payoutDate = today.with(TemporalAdjusters.nextOrSame(payoutDay));
        LocalDate reviewDate = payoutDate.minusDays(reviewLeadDays);

        if (today.isBefore(reviewDate) || today.isAfter(payoutDate)) {
            return;
        }

        LocalDate periodEnd = reviewDate.minusDays(1); // Sunday before review day
        int periodWeek = periodEnd.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear());
        int periodYear = periodEnd.get(java.time.temporal.WeekFields.ISO.weekBasedYear());

        List<UserRow> users;
        try {
            users = userDirectoryClient.getAllUsers();
        } catch (Exception e) {
            log.warn("Could not fetch users for scheduling", e);
            return;
        }

        for (UserRow u : users) {
            UUID userId;
            try {
                userId = UUID.fromString(u.userId());
            } catch (Exception ignore) {
                continue;
            }

            if (!"ACTIVE".equalsIgnoreCase(u.status())) {
                continue;
            }

            if (payslipRepository.existsByWeekBasedYearAndWeekNumberAndUserId(periodYear, periodWeek, userId)) {
                continue;
            }

            int frequencyMinutes = u.payslipFrequencyMinutes() != null ? u.payslipFrequencyMinutes() : 10080;
            if (!isDueForPayout(userId, payoutDate, frequencyMinutes)) {
                continue;
            }

            try {
                payrollService.createScheduledPayslip(userId, periodEnd, payoutDate);
            } catch (StatusRuntimeException grpcErr) {
                log.debug("Skipping scheduled payslip for userId={} (grpc error: {})", userId, grpcErr.getStatus());
            } catch (Exception e) {
                log.warn("Failed to create scheduled payslip for userId={}", userId, e);
            }
        }
    }

    private boolean isDueForPayout(UUID userId, LocalDate payoutDate, int frequencyMinutes) {
        var lastOpt = payslipRepository.findTopByUserIdOrderByDateOfIssueDesc(userId);
        if (lastOpt.isEmpty()) return true;

        var last = lastOpt.get();
        LocalDate lastPayout = last.getAvailableToUserAt() != null ? last.getAvailableToUserAt() : last.getDateOfIssue();
        if (lastPayout == null) return true;

        long deltaMinutes = Duration.between(lastPayout.atStartOfDay(), payoutDate.atStartOfDay()).toMinutes();
        return deltaMinutes >= frequencyMinutes;
    }
}
