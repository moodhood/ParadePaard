package com.pm.contractservice.repository;

import com.pm.contractservice.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ContractRepository extends JpaRepository<Contract, UUID> {
    boolean existsByUserId(UUID userId);

}
