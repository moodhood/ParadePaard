package com.pm.userservice.repository;

import com.pm.userservice.model.HorecaRuleItem;
import com.pm.userservice.model.HorecaRuleSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HorecaRuleItemRepository extends JpaRepository<HorecaRuleItem, UUID> {
    List<HorecaRuleItem> findAllByRuleVersionIdOrderBySectionKeyAscSortOrderAsc(UUID ruleVersionId);
    void deleteByRuleVersionIdAndSectionKey(UUID ruleVersionId, HorecaRuleSection sectionKey);
}
