package com.pm.contractservice.mapper;

import com.pm.contractservice.dto.ContractResponseDTO;
import com.pm.contractservice.model.Contract;

public class ContractMapper {
    public static ContractResponseDTO toDTO(Contract contract){
        ContractResponseDTO contractResponseDTO = new ContractResponseDTO();
        contractResponseDTO.setContractId(contract.getContractId());

        contractResponseDTO.setStartDate(contract.getStartDate());
        contractResponseDTO.setEndDate(contract.getEndDate());
        contractResponseDTO.setWageTaxAmountTest(contract.getWageTaxAmountTest());

        return contractResponseDTO;
    }

}
