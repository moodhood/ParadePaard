package com.pm.contractservice.service;

import com.pm.contractservice.dto.SignContractRequestDTO;
import com.pm.contractservice.grpc.UserServiceGrpcClient;
import com.pm.contractservice.model.Contract;
import com.pm.contractservice.model.ContractStatus;
import com.pm.contractservice.model.ContractType;
import com.pm.contractservice.model.PaymentFrequency;
import com.pm.contractservice.repository.ContractRepository;
import com.pm.contractservice.repository.FunctionRepository;
import com.pm.contractservice.service.events.ContractEventPublisher;
import com.pm.contractservice.service.pdf.ContractPdfGenerator;
import com.pm.contractservice.validation.ContractValidator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContractServiceSignContractTest {

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

    @Test
    void signContractStoresSignatureAuditDetailsAndLocksContractAsSigned() {
        UUID contractId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Contract contract = contract(contractId, userId);
        when(contractValidator.getExistingContract(contractId)).thenReturn(contract);
        when(contractRepository.save(contract)).thenReturn(contract);

        SignContractRequestDTO request = new SignContractRequestDTO();
        request.setTypedSignatureName("Imre Janssen");
        request.setDrawnSignatureImage("data:image/png;base64,abc123");
        request.setAgreementCheckboxText("I have read the employment contract and agree to it.");
        request.setContractVersion("2026-05-employment-v1");
        request.setDocumentHash("sha256:contract-hash");
        request.setIpAddress("203.0.113.10");
        request.setBrowserUserAgent("Mozilla/5.0 Test Browser");

        ContractService service = contractService();
        service.signContract(contractId, userId, request);

        assertThat(contract.getStatus()).isEqualTo(ContractStatus.SIGNED);
        assertThat(contract.getEmployeeSignedAt()).isNotNull();
        assertThat(contract.getSignedUserId()).isEqualTo(userId);
        assertThat(contract.getTypedSignatureName()).isEqualTo("Imre Janssen");
        assertThat(contract.getDrawnSignatureImage()).isEqualTo("data:image/png;base64,abc123");
        assertThat(contract.getAgreementCheckboxText()).isEqualTo("I have read the employment contract and agree to it.");
        assertThat(contract.getContractVersion()).isEqualTo("2026-05-employment-v1");
        assertThat(contract.getDocumentHash()).isEqualTo("sha256:contract-hash");
        assertThat(contract.getIpAddress()).isEqualTo("203.0.113.10");
        assertThat(contract.getBrowserUserAgent()).isEqualTo("Mozilla/5.0 Test Browser");
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

    private static Contract contract(UUID contractId, UUID userId) {
        Contract contract = new Contract();
        contract.setContractId(contractId);
        contract.setUserId(userId);
        contract.setStartDate(LocalDate.of(2026, 5, 1));
        contract.setContractType(ContractType.ON_CALL_RUNNER);
        contract.setStatus(ContractStatus.SENT_TO_EMPLOYEE);
        contract.setGrossHourlyWage(new BigDecimal("18.50"));
        contract.setTravelAllowance(Boolean.TRUE);
        contract.setPaymentFrequency(PaymentFrequency.WEEKLY);
        return contract;
    }
}
