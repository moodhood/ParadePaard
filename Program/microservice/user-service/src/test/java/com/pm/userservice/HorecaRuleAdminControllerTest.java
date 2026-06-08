package com.pm.userservice;

import com.pm.userservice.controller.HorecaRuleAdminController;
import com.pm.userservice.dto.HorecaRulePublishRequestDTO;
import com.pm.userservice.dto.HorecaRuleVersionDTO;
import com.pm.userservice.service.HorecaRuleService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class HorecaRuleAdminControllerTest {

    private final HorecaRuleService horecaRuleService = mock(HorecaRuleService.class);
    private final HorecaRuleAdminController controller = new HorecaRuleAdminController(horecaRuleService);

    @Test
    void getCurrentRulesUsesCompanyIdFromJwtClaims() {
        UUID companyId = UUID.randomUUID();
        HorecaRuleVersionDTO dto = new HorecaRuleVersionDTO();
        dto.setCompanyId(companyId.toString());
        when(horecaRuleService.getCurrentRules(companyId)).thenReturn(dto);

        var response = controller.getCurrentRules(authenticationFor(UUID.randomUUID(), companyId));

        assertThat(response.getBody()).isEqualTo(dto);
        verify(horecaRuleService).getCurrentRules(companyId);
    }

    @Test
    void publishPassesTheBearerTokenThroughToTheService() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        HorecaRulePublishRequestDTO request = new HorecaRulePublishRequestDTO();
        request.setEffectiveFrom("2026-07-01");
        HorecaRuleVersionDTO dto = new HorecaRuleVersionDTO();
        dto.setEffectiveFrom("2026-07-01");
        when(horecaRuleService.publishCurrentDraft(eq(companyId), eq(userId), eq(request), eq("token-123")))
                .thenReturn(dto);

        MockHttpServletRequest http = new MockHttpServletRequest();
        http.addHeader("Authorization", "Bearer token-123");

        var response = controller.publishCurrentDraft(request, authenticationFor(userId, companyId), http);

        assertThat(response.getBody()).isEqualTo(dto);
        verify(horecaRuleService).publishCurrentDraft(companyId, userId, request, "token-123");
    }

    private static JwtAuthenticationToken authenticationFor(UUID userId, UUID companyId) {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("userId", userId.toString())
                .claim("companyId", companyId.toString())
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60))
                .build();
        return new JwtAuthenticationToken(jwt);
    }
}
