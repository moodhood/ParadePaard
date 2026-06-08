package com.pm.contractservice.service;

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
import user.UserDataResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContractServiceCompanyScopeTest {
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
    void getContractsReturnsOnlyContractsForTheRequestedCompany() {
        UUID companyId = UUID.randomUUID();
        UUID otherCompanyId = UUID.randomUUID();
        UUID companyUserId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();

        when(contractRepository.findAll()).thenReturn(List.of(
                contract(UUID.randomUUID(), companyUserId),
                contract(UUID.randomUUID(), otherUserId)
        ));
        when(userServiceGrpcClient.requestUserData(companyUserId.toString()))
                .thenReturn(UserDataResponse.newBuilder().setCompanyId(companyId.toString()).build());
        when(userServiceGrpcClient.requestUserData(otherUserId.toString()))
                .thenReturn(UserDataResponse.newBuilder().setCompanyId(otherCompanyId.toString()).build());

        ContractService service = new ContractService(
                contractRepository,
                contractValidator,
                userServiceGrpcClient,
                contractEventPublisher,
                contractPdfGenerator,
                functionRepository,
                contractNotificationService
        );

        assertThat(service.getContracts(companyId))
                .singleElement()
                .satisfies(contract -> assertThat(contract.getUserId()).isEqualTo(companyUserId));
    }

    private static Contract contract(UUID contractId, UUID userId) {
        Contract contract = new Contract();
        contract.setContractId(contractId);
        contract.setUserId(userId);
        contract.setStartDate(LocalDate.of(2026, 6, 1));
        contract.setContractType(ContractType.ON_CALL_RUNNER);
        contract.setStatus(ContractStatus.DRAFT);
        contract.setGrossHourlyWage(new BigDecimal("18.50"));
        contract.setTravelAllowance(Boolean.TRUE);
        contract.setPaymentFrequency(PaymentFrequency.WEEKLY);
        return contract;
    }
}
