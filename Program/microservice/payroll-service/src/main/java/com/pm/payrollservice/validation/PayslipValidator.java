package com.pm.payrollservice.validation;

import com.pm.payrollservice.exception.ISOWeekPayslipAlreadyExistsException;
import com.pm.payrollservice.model.Payslip;
import com.pm.payrollservice.model.PayslipStatus;
import com.pm.payrollservice.repository.PayslipRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.UUID;

@Component
public class PayslipValidator {

    private final PayslipRepository payslipRepository;

    public PayslipValidator(PayslipRepository payslipRepository) {
        this.payslipRepository = payslipRepository;
    }

    public void validateNoDuplicate(UUID userId, LocalDate dateOfIssue) {
        int weekNumber = dateOfIssue.get(WeekFields.ISO.weekOfWeekBasedYear());
        int weekBasedYear = dateOfIssue.get(WeekFields.ISO.weekBasedYear());
        List<Payslip> matches = payslipRepository.findByWeekBasedYearAndWeekNumberAndUserId(weekBasedYear, weekNumber, userId);
        if (matches.isEmpty()) return;

        boolean hasBlocking = matches.stream()
                .map(Payslip::getStatus)
                .map(s -> s == null ? PayslipStatus.RELEASED : s)
                .anyMatch(status -> status != PayslipStatus.NEEDS_ATTENTION && status != PayslipStatus.DISPUTED);

        if (hasBlocking) {
            throw new ISOWeekPayslipAlreadyExistsException(
                    "Payslip for ISO week " + weekNumber + " already exists for user " + userId
            );
        }
    }
}
