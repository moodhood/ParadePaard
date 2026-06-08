package com.pm.userservice.repository;

import com.pm.userservice.model.HorecaRuleVersion;
import com.pm.userservice.model.HorecaRuleVersionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HorecaRuleVersionRepository extends JpaRepository<HorecaRuleVersion, UUID> {
    Optional<HorecaRuleVersion> findTopByCompanyIdAndStatusOrderByCreatedAtDesc(UUID companyId, HorecaRuleVersionStatus status);
    Optional<HorecaRuleVersion> findTopByCompanyIdAndStatusOrderByPublishedAtDesc(UUID companyId, HorecaRuleVersionStatus status);
    List<HorecaRuleVersion> findAllByCompanyIdAndStatus(UUID companyId, HorecaRuleVersionStatus status);
}
