package com.pm.userservice.repository;

import com.pm.userservice.model.CaoTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CaoTemplateRepository extends JpaRepository<CaoTemplate, UUID> {
    List<CaoTemplate> findAllByCompanyId(UUID companyId);
    Optional<CaoTemplate> findByCaoIdAndCompanyId(UUID caoId, UUID companyId);
    boolean existsByNameAndCompanyId(String name, UUID companyId);
    boolean existsByNameAndCompanyIdAndCaoIdNot(String name, UUID companyId, UUID caoId);
}
