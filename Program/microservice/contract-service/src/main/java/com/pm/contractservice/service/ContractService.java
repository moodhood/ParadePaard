package com.pm.contractservice.service;

import com.pm.contractservice.dto.ContractRequestDTO;
import com.pm.contractservice.dto.ContractResponseDTO;
import com.pm.contractservice.mapper.ContractMapper;
import com.pm.contractservice.model.Contract;
import com.pm.contractservice.repository.ContractRepository;
import com.pm.contractservice.validation.ContractValidator;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ContractService {

    private final ContractRepository contractRepository;
    private final ContractValidator contractValidator;

    public ContractService(ContractRepository contractRepository,
                           ContractValidator contractValidator) {
        this.contractRepository = contractRepository;
        this.contractValidator = contractValidator;
    }

    public List<ContractResponseDTO> getContracts() {
        return contractRepository.findAll()
                .stream()
                .map(ContractMapper::toDTO)
                .toList();
    }

    public ContractResponseDTO createContract(ContractRequestDTO dto) {
        contractValidator.ensureNoContractForUser(UUID.fromString(dto.getUserId()));
        contractValidator.ensureFunctionsExist(dto.getFunctions());

        Contract contract = ContractMapper.toModel(dto);
        contract = contractRepository.save(contract);
        return ContractMapper.toDTO(contract);
    }

    public ContractResponseDTO updateContract(UUID id, ContractRequestDTO dto) {
        Contract contract = contractValidator.getExistingContract(id);
        contractValidator.ensureFunctionsExist(dto.getFunctions());

        contract.setUserId(UUID.fromString(dto.getUserId()));
        contract.setStartDate(LocalDate.parse(dto.getStartDate()));
        contract.setEndDate(LocalDate.parse(dto.getEndDate()));
        contract.setWageTaxAmountTest(dto.getWageTaxAmountTest());
        contract.setFunctions(dto.getFunctions());

        contract = contractRepository.save(contract);
        return ContractMapper.toDTO(contract);
    }

    public void deleteContract(UUID id) {
        contractValidator.getExistingContract(id);
        contractRepository.deleteById(id);
    }
}