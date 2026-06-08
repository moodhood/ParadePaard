package com.pm.userservice.repository;

import com.pm.userservice.model.AuditLogEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface AuditLogEntryRepository extends JpaRepository<AuditLogEntry, UUID>, JpaSpecificationExecutor<AuditLogEntry> {
    Page<AuditLogEntry> findAllByCompanyIdOrderByOccurredAtDesc(UUID companyId, Pageable pageable);
}
