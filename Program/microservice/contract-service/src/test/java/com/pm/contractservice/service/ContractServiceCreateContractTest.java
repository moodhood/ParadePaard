package com.pm.contractservice.service;

import com.pm.contractservice.dto.ContractRequestDTO;
import com.pm.contractservice.dto.ContractResponseDTO;
import com.pm.contractservice.integration.AuditLogClient;
import com.pm.contractservice.grpc.UserServiceGrpcClient;
import com.pm.contractservice.model.Contract;
import com.pm.contractservice.repository.ContractRepository;
import com.pm.contractservice.repository.FunctionRepository;
import com.pm.contractservice.service.events.ContractEventPublisher;
import com.pm.contractservice.service.pdf.ContractPdfGenerator;
import com.pm.contractservice.validation.ContractValidator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContractServiceCreateContractTest {

    @Mock
    private ContractRepository contractRepository;
    @Mock
    private ContractValidator contractValidator;
    @Mock
    private UserServiceGrpcClient userServiceGrpcClient;
    @Mock
    private ContractEventPublisher contractEventPublisher;
    @Mock
    private ContractPdfGenerator contractPdfGenerator;
    @Mock
    private FunctionRepository functionRepository;
    @Mock
    private ContractNotificationService contractNotificationService;
    @Mock
    private AuditLogClient auditLogClient;

    @Test
    void createContractStillSucceedsWhenAuditLoggingFails() throws Exception {
        UUID contractId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Contract savedContract = new Contract();
        savedContract.setContractId(contractId);
        savedContract.setUserId(userId);
        savedContract.setStartDate(LocalDate.of(2026, 7, 1));
        savedContract.setGrossHourlyWage(new BigDecimal("18.50"));
        savedContract.setTravelAllowance(Boolean.TRUE);

        when(contractRepository.save(any(Contract.class))).thenReturn(savedContract);
        doThrow(new RuntimeException("audit unavailable"))
                .when(auditLogClient).record(eq("access-token"), any());

        ContractService service = contractService();
        injectAuditLogClient(service);

        ContractResponseDTO response = service.createContract(request(userId), "access-token");

        assertThat(response.getContractId()).isEqualTo(contractId);
        assertThat(response.getUserId()).isEqualTo(userId);
        verify(contractEventPublisher).publishContractCreated(savedContract);
    }

    private ContractService contractService() {
        return new ContractService(
                contractRepository,
                contractValidator,
                userServiceGrpcClient,
                contractEventPublisher,
                contractPdfGenerator,
                functionRepository,
                contractNotificationService
        );
    }

    private void injectAuditLogClient(ContractService service) throws Exception {
        Field field = ContractService.class.getDeclaredField("auditLogClient");
        field.setAccessible(true);
        field.set(service, auditLogClient);
    }

    private static ContractRequestDTO request(UUID userId) {
        ContractRequestDTO request = new ContractRequestDTO();
        request.setUserId(userId.toString());
        request.setStartDate("2026-07-01");
        request.setContractType("ON_CALL_RUNNER");
        request.setGrossHourlyWage(new BigDecimal("18.50"));
        request.setTravelAllowance(Boolean.TRUE);
        return request;
    }
}
