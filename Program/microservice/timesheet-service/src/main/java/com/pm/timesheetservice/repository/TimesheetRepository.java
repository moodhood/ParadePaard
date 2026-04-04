package com.pm.timesheetservice.repository;

import com.pm.timesheetservice.model.Timesheet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimesheetRepository extends JpaRepository<Timesheet, UUID> {
    Optional<Timesheet> findByUserId(UUID userId);
    List<Timesheet> findByUserIdAndWeekNumberAndWeekBasedYear(UUID userId, Integer weekNumber, Integer weekBasedYear);
    List<Timesheet> findByUserIdOrderByDateOfIssueDesc(UUID userId);
    Page<Timesheet> findAllByOrderByDateOfIssueDesc(Pageable pageable);
    Page<Timesheet> findByUserIdOrderByDateOfIssueDesc(UUID userId, Pageable pageable);
}
