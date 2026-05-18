package com.pm.userservice.security;

import com.pm.userservice.model.UserStatus;
import com.pm.userservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("onboardingPermission")
public class OnboardingPermission {
    private static final Logger log = LoggerFactory.getLogger(OnboardingPermission.class);

    private final UserRepository userRepository;

    public OnboardingPermission(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean canComplete(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) {
            log.warn("Missing userId claim for onboarding completion");
            return false;
        }

        return userRepository.findByUserId(userId)
                .map(user -> user.getStatus() == UserStatus.PENDING_SETUP
                        || user.getStatus() == UserStatus.CHANGES_REQUESTED)
                .orElse(false);
    }

    private UUID extractUserId(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            UUID fromClaim = parseUserId(jwt.getClaimAsString("userId"));
            if (fromClaim != null) {
                return fromClaim;
            }
            return parseUserId(jwt.getSubject());
        }
        return parseUserId(authentication.getName());
    }

    private UUID parseUserId(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(raw.trim());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
