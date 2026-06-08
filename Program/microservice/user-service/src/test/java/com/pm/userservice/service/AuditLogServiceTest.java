package com.pm.userservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pm.userservice.repository.AuditLogEntryRepository;
import com.pm.userservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogEntryRepository auditLogEntryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ObjectMapper objectMapper;

    @Test
    void listUsesSimpleCompanyQueryWhenNoOptionalFiltersArePresent() {
        UUID companyId = UUID.randomUUID();
        when(auditLogEntryRepository.findAllByCompanyIdOrderByOccurredAtDesc(
                eq(companyId),
                any(PageRequest.class)
        )).thenReturn(new PageImpl<>(List.of()));

        AuditLogService service = service();
        service.list(companyId, null, null, null, null, null, null, "   ", 0, 50);

        verify(auditLogEntryRepository).findAllByCompanyIdOrderByOccurredAtDesc(
                eq(companyId),
                any(PageRequest.class)
        );
        verify(auditLogEntryRepository, never()).findAll(any(Specification.class), any(PageRequest.class));
    }

    @Test
    void listUsesSpecificationQueryWhenAnyOptionalFilterIsPresent() {
        UUID companyId = UUID.randomUUID();
        when(auditLogEntryRepository.findAll(
                any(Specification.class),
                any(PageRequest.class)
        )).thenReturn(new PageImpl<>(List.of()));

        AuditLogService service = service();
        service.list(companyId, "PLANNING", "UPDATED", "SHIFT", null, null, null, "Alice", 0, 50);

        verify(auditLogEntryRepository).findAll(
                any(Specification.class),
                any(PageRequest.class)
        );
        verify(auditLogEntryRepository, never()).findAllByCompanyIdOrderByOccurredAtDesc(
                any(),
                any(PageRequest.class)
        );
    }

    private AuditLogService service() {
        return new AuditLogService(auditLogEntryRepository, userRepository, objectMapper);
    }
}
