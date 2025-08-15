package com.pm.payrollservice.repository;

import com.pm.payrollservice.model.PayslipDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PayslipDocumentRepository extends JpaRepository<PayslipDocument, UUID> {
    Optional<PayslipDocument> findTopByPayslipIdOrderByCreatedAtDesc(UUID payslipId);
}
