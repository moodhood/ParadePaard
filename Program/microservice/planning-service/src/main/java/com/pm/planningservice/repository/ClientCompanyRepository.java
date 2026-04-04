package com.pm.planningservice.repository;

import com.pm.planningservice.model.ClientCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClientCompanyRepository extends JpaRepository<ClientCompany, UUID> {
    List<ClientCompany> findByOwnerCompanyIdOrderByNameAsc(UUID ownerCompanyId);
    Page<ClientCompany> findByOwnerCompanyId(UUID ownerCompanyId, Pageable pageable);

    Optional<ClientCompany> findByClientCompanyIdAndOwnerCompanyId(UUID clientCompanyId, UUID ownerCompanyId);

    boolean existsByOwnerCompanyIdAndNameIgnoreCase(UUID ownerCompanyId, String name);

    boolean existsByOwnerCompanyIdAndNameIgnoreCaseAndClientCompanyIdNot(
            UUID ownerCompanyId,
            String name,
            UUID clientCompanyId
    );
}
