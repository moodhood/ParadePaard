package com.pm.contractservice.mapper;

import com.pm.contractservice.dto.ContractRequestDTO;
import com.pm.contractservice.model.Contract;
import com.pm.contractservice.model.ContractType;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ContractMapperTest {

    @Test
    void mapsHorecaContractTypeLabelsToPersistedContractTypes() {
        assertThat(toContractType("FULL_TIME", "Supervisor")).isEqualTo(ContractType.FIXED_HOURS);
        assertThat(toContractType("PART_TIME", "Bar employee")).isEqualTo(ContractType.FIXED_HOURS);
        assertThat(toContractType("ZERO_HOURS", "Runner")).isEqualTo(ContractType.ON_CALL_RUNNER);
        assertThat(toContractType("ZERO_HOURS", "Bar employee")).isEqualTo(ContractType.ON_CALL_BAR);
    }

    private static ContractType toContractType(String contractType, String functionName) {
        Contract contract = ContractMapper.toModel(request(contractType, functionName));
        return contract.getContractType();
    }

    private static ContractRequestDTO request(String contractType, String functionName) {
        ContractRequestDTO request = new ContractRequestDTO();
        request.setUserId(UUID.randomUUID().toString());
        request.setFunctionName(functionName);
        request.setStartDate("2026-06-01");
        request.setContractType(contractType);
        request.setTravelAllowance(false);
        return request;
    }
}
