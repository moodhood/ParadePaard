package com.pm.planningservice.repository;

import com.pm.planningservice.model.PlanningLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlanningLocationRepository extends JpaRepository<PlanningLocation, UUID> {
    List<PlanningLocation> findByOwnerCompanyIdOrderByNameAsc(UUID ownerCompanyId);

    Optional<PlanningLocation> findByLocationIdAndOwnerCompanyId(UUID locationId, UUID ownerCompanyId);

    boolean existsByOwnerCompanyIdAndNameIgnoreCase(UUID ownerCompanyId, String name);

    boolean existsByOwnerCompanyIdAndNameIgnoreCaseAndLocationIdNot(UUID ownerCompanyId, String name, UUID locationId);
}
