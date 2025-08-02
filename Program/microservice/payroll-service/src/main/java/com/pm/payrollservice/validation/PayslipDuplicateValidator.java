package com.pm.payrollservice.validation;

import com.pm.payrollservice.exception.ISOWeekPayslipAlreadyExistsException;
import com.pm.payrollservice.repository.PayslipRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.Locale;
import java.util.UUID;

@Component
public class PayslipDuplicateValidator {

    private final PayslipRepository payslipRepository;

    public PayslipDuplicateValidator(PayslipRepository payslipRepository) {
        this.payslipRepository = payslipRepository;
    }

    public void validateNoDuplicate(UUID userId, LocalDate dateOfIssue) {
        int weekNumber = dateOfIssue.get(WeekFields.ISO.weekOfWeekBasedYear());
        int weekBasedYear = dateOfIssue.get(WeekFields.ISO.weekBasedYear());
        boolean exists = payslipRepository.existsByWeekBasedYearAndWeekNumberAndUserId(weekBasedYear, weekNumber, userId);
        if (exists) {
            throw new ISOWeekPayslipAlreadyExistsException(
                    "Payslip for ISO week " + weekNumber + " already exists for user " + userId
            );
        }
    }
}
