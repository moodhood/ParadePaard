package com.pm.userservice.repository;

import com.pm.userservice.model.HorecaJobPresetConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HorecaJobPresetConfigRepository extends JpaRepository<HorecaJobPresetConfig, UUID> {
    List<HorecaJobPresetConfig> findAllByRuleVersionIdOrderBySortOrderAsc(UUID ruleVersionId);
    void deleteByRuleVersionId(UUID ruleVersionId);
}
