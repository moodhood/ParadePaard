package com.pm.contractservice.service;

import com.pm.contractservice.dto.ContractResponseDTO;
import com.pm.contractservice.mapper.ContractMapper;
import com.pm.contractservice.model.Contract;
import com.pm.contractservice.repository.ContractRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContractService {
    private final ContractRepository contractRepository;

    public ContractService(ContractRepository contractRepository) {
        this.contractRepository = contractRepository;
    }

    public List<ContractResponseDTO> getContracts(){
        List<Contract> contracts = contractRepository.findAll();
        return contracts.stream().map(ContractMapper::toDTO).toList();
    }

}
