package com.pm.contractservice.validation;

import com.pm.contractservice.exception.ContractAlreadyExistsException;
import com.pm.contractservice.exception.ContractNotFoundException;
import com.pm.contractservice.model.Contract;
import com.pm.contractservice.repository.ContractRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ContractValidator {

    private final ContractRepository contractRepository;
    public ContractValidator(ContractRepository contractRepository) {
        this.contractRepository = contractRepository;
    }

    public void ensureNoContractForUser(UUID userId) {
        if (contractRepository.existsByUserId(userId)) {
            throw new ContractAlreadyExistsException(
                    "A contract for user with id " + userId + " already exists");
        }
    }

    public Contract getExistingContract(UUID contractId) {
        return contractRepository.findById(contractId)
                .orElseThrow(() ->
                        new ContractNotFoundException(
                                "Contract with id " + contractId + " not found"));
    }

}
