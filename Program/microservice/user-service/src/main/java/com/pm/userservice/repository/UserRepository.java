package com.pm.userservice.repository;

import com.pm.userservice.model.User;
import com.pm.userservice.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User>  findByUserId(UUID id);
    Optional<User> findByUserIdAndCompanyId(UUID id, UUID companyId);
    List<User> findByUserIdIn(Collection<UUID> userIds);
    List<User> findAllByCompanyId(UUID companyId);
    Page<User> findAllByCompanyId(UUID companyId, Pageable pageable);

    @Query("""
            SELECT u
            FROM User u
            WHERE (:companyId IS NULL OR u.companyId = :companyId)
              AND (:status IS NULL OR u.status = :status)
              AND (
                   LOWER(COALESCE(u.preferredName, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(COALESCE(u.firstNames, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(COALESCE(u.lastName, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(COALESCE(u.position, '')) LIKE LOWER(CONCAT('%', :q, '%'))
              )
            """)
    Page<User> searchUsers(
            @Param("companyId") UUID companyId,
            @Param("status") UserStatus status,
            @Param("q") String q,
            Pageable pageable
    );

    void deleteByUserId(UUID id);


    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmailAndUserIdNot(String email, UUID id);
    boolean existsByEmailAndCompanyIdAndUserIdNot(String email, UUID companyId, UUID id);
    boolean existsByMobileNumberAndUserIdNot(String mobileNumber, UUID id);
    long countByCompanyId(UUID companyId);
    long countByCompanyIdAndStatus(UUID companyId, UserStatus status);
    long countByCompanyIdAndStatusIn(UUID companyId, Collection<UserStatus> statuses);

}
