package com.pm.planningservice.repository;

import com.pm.planningservice.model.TravelClaim;
import com.pm.planningservice.model.TravelClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TravelClaimRepository extends JpaRepository<TravelClaim, UUID> {
    Optional<TravelClaim> findByScheduleEntryId(UUID scheduleEntryId);

    List<TravelClaim> findByScheduleEntryIdIn(Collection<UUID> scheduleEntryIds);

    List<TravelClaim> findByStatusOrderBySubmittedAtAsc(TravelClaimStatus status);
}
