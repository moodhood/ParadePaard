package com.pm.contractservice.repository;

import com.pm.contractservice.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ContractRepository extends JpaRepository<Contract, UUID> {

    Optional<Contract> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);
    boolean existsByUserIdAndContractIdNot(UUID userId, UUID contractId);
}
