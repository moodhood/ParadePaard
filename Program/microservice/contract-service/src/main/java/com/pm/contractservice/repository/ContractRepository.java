package com.pm.contractservice.repository;

import com.pm.contractservice.model.Contract;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContractRepository extends JpaRepository<Contract, UUID> {

    Optional<Contract> findByUserId(UUID userId);

    List<Contract> findByUserIdOrderByStartDateDesc(UUID userId);

    @Query("""
            select c from Contract c
            where c.userId = :userId
              and c.status in (
                  com.pm.contractservice.model.ContractStatus.FINALIZED,
                  com.pm.contractservice.model.ContractStatus.SIGNED
              )
              and c.startDate <= :periodEnd
              and (c.endDate is null or c.endDate >= :periodStart)
            order by c.startDate desc
            """)
    List<Contract> findPayrollActiveForPeriod(
            @Param("userId") UUID userId,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd
    );

    @Query("""
            select c from Contract c
            where c.userId = :userId
              and c.status = com.pm.contractservice.model.ContractStatus.SIGNED
              and c.startDate <= :periodEnd
              and (c.endDate is null or c.endDate >= :periodStart)
            order by c.startDate desc
            """)
    List<Contract> findSignedActiveForPeriod(
            @Param("userId") UUID userId,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd
    );

    @Query("""
            select c from Contract c
            where c.userId = :userId
              and c.startDate <= :periodEnd
              and (c.endDate is null or c.endDate >= :periodStart)
            order by c.startDate desc
            """)
    List<Contract> findActiveForPeriod(
            @Param("userId") UUID userId,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd
    );

    @Query("""
            select count(c) > 0 from Contract c
            where c.userId = :userId
              and (:excludedContractId is null or c.contractId <> :excludedContractId)
              and c.startDate <= :endDate
              and (c.endDate is null or c.endDate >= :startDate)
            """)
    boolean existsOverlappingContract(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("excludedContractId") UUID excludedContractId
    );

    boolean existsByUserId(UUID userId);
    boolean existsByUserIdAndContractIdNot(UUID userId, UUID contractId);
}
