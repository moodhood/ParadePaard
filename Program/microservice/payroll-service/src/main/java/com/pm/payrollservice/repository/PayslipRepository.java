package com.pm.payrollservice.repository;

import com.pm.payrollservice.model.Payslip;
import com.pm.payrollservice.model.PayslipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, UUID>{
    boolean existsByWeekBasedYearAndWeekNumberAndUserId(int weekBasedYear, int weekNumber, UUID userId);

    List<Payslip> findByWeekBasedYearAndWeekNumberAndUserId(int weekBasedYear, int weekNumber, UUID userId);

    List<Payslip> findByUserIdOrderByDateOfIssueDesc(UUID userId);

    List<Payslip> findByUserIdAndStatusOrderByDateOfIssueDesc(UUID userId, PayslipStatus status);

    Optional<Payslip> findTopByUserIdOrderByDateOfIssueDesc(UUID userId);

    List<Payslip> findByStatusAndAvailableToUserAtLessThanEqual(PayslipStatus status, LocalDate availableToUserAt);

    List<Payslip> findByStatusAndAvailableToUserAtLessThan(PayslipStatus status, LocalDate availableToUserAt);

    List<Payslip> findByStatusAndAvailableToUserAt(PayslipStatus status, LocalDate availableToUserAt);

    List<Payslip> findByStatusOrderByDateOfIssueDesc(PayslipStatus status);

    List<Payslip> findByStatusInOrderByDateOfIssueDesc(List<PayslipStatus> statuses);
}
