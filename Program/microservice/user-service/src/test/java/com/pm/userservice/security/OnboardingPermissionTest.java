package com.pm.userservice.security;

import com.pm.userservice.model.User;
import com.pm.userservice.model.UserStatus;
import com.pm.userservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OnboardingPermissionTest {
    private final UserRepository userRepository = mock(UserRepository.class);
    private final OnboardingPermission onboardingPermission = new OnboardingPermission(userRepository);

    @Test
    void canCompleteAllowsOnlySetupStatuses() {
        UUID userId = UUID.randomUUID();
        User pendingSetup = new User();
        pendingSetup.setUserId(userId);
        pendingSetup.setStatus(UserStatus.PENDING_SETUP);
        when(userRepository.findByUserId(userId)).thenReturn(Optional.of(pendingSetup));

        assertThat(onboardingPermission.canComplete(authentication(userId))).isTrue();

        pendingSetup.setStatus(UserStatus.ACTIVE);

        assertThat(onboardingPermission.canComplete(authentication(userId))).isFalse();
    }

    private static TestingAuthenticationToken authentication(UUID userId) {
        TestingAuthenticationToken authentication = new TestingAuthenticationToken(userId.toString(), null);
        authentication.setAuthenticated(true);
        return authentication;
    }
}
