package com.pm.authservice.repository;

import com.pm.authservice.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    void deleteAllByUserIdAndUsedAtIsNull(UUID userId);

    void deleteAllByUserIdAndTokenHashNot(UUID userId, String tokenHash);

    void deleteAllByExpiresAtBefore(Instant now);
}
