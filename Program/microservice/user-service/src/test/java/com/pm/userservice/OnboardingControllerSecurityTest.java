package com.pm.userservice;

import com.pm.userservice.config.SecurityConfig;
import com.pm.userservice.controller.OnboardingController;
import com.pm.userservice.security.OnboardingPermission;
import com.pm.userservice.service.OnboardingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OnboardingController.class)
@Import(SecurityConfig.class)
class OnboardingControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OnboardingService onboardingService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @MockitoBean(name = "onboardingPermission")
    private OnboardingPermission onboardingPermission;

    @Test
    void idDocumentUploadAllowsPendingSetupUserWithoutRolePermissions() throws Exception {
        UUID userId = UUID.randomUUID();
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "HS256")
                .subject("applicant@example.com")
                .claim("userId", userId.toString())
                .claim("permissions", List.of())
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(900))
                .build();
        when(jwtDecoder.decode("token")).thenReturn(jwt);
        when(onboardingPermission.canComplete(any(Authentication.class))).thenReturn(true);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "id.png",
                MediaType.IMAGE_PNG_VALUE,
                new byte[] {1, 2, 3}
        );

        mockMvc.perform(multipart("/user/setup/id-document-image")
                        .file(file)
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isOk());
    }
}
