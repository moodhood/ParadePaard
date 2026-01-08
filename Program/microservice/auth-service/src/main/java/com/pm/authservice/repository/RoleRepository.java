package com.pm.authservice.repository;

import com.pm.authservice.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(String name);
    Optional<Role> findByNameAndCompanyId(String name, UUID companyId);
    Optional<Role> findByIdAndCompanyId(UUID id, UUID companyId);
    boolean existsByNameAndCompanyId(String name, UUID companyId);
    List<Role> findAllByCompanyId(UUID companyId);
}
