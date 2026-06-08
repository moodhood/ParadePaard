package com.pm.userservice.controller;

import com.pm.userservice.dto.HorecaJobPresetUpdateDTO;
import com.pm.userservice.dto.HorecaRulePublishRequestDTO;
import com.pm.userservice.dto.HorecaRuleSectionUpdateDTO;
import com.pm.userservice.dto.HorecaRuleVersionDTO;
import com.pm.userservice.model.HorecaRuleSection;
import com.pm.userservice.security.TokenExtractor;
import com.pm.userservice.service.HorecaRuleService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/admin/horeca-rules")
public class HorecaRuleAdminController {

    private final HorecaRuleService horecaRuleService;

    public HorecaRuleAdminController(HorecaRuleService horecaRuleService) {
        this.horecaRuleService = horecaRuleService;
    }

    @GetMapping("/current")
    @PreAuthorize("hasAuthority('CAN_MANAGE_COMPANY')")
    public ResponseEntity<HorecaRuleVersionDTO> getCurrentRules(Authentication authentication) {
        UUID companyId = requireCompanyId(authentication);
        return ResponseEntity.ok(horecaRuleService.getCurrentRules(companyId));
    }

    @PutMapping("/sections/{sectionKey}")
    @PreAuthorize("hasAuthority('CAN_MANAGE_COMPANY')")
    public ResponseEntity<HorecaRuleVersionDTO> updateSection(
            @PathVariable String sectionKey,
            @RequestBody HorecaRuleSectionUpdateDTO request,
            Authentication authentication
    ) {
        UUID companyId = requireCompanyId(authentication);
        UUID userId = requireUserId(authentication);
        return ResponseEntity.ok(
                horecaRuleService.updateSection(companyId, userId, HorecaRuleSection.valueOf(sectionKey), request)
        );
    }

    @PutMapping("/job-presets")
    @PreAuthorize("hasAuthority('CAN_MANAGE_COMPANY')")
    public ResponseEntity<HorecaRuleVersionDTO> updateJobPresets(
            @RequestBody HorecaJobPresetUpdateDTO request,
            Authentication authentication
    ) {
        UUID companyId = requireCompanyId(authentication);
        UUID userId = requireUserId(authentication);
        return ResponseEntity.ok(horecaRuleService.updateJobPresets(companyId, userId, request));
    }

    @PostMapping("/publish")
    @PreAuthorize("hasAuthority('CAN_MANAGE_COMPANY')")
    public ResponseEntity<HorecaRuleVersionDTO> publishCurrentDraft(
            @RequestBody HorecaRulePublishRequestDTO request,
            Authentication authentication,
            HttpServletRequest httpServletRequest
    ) {
        UUID companyId = requireCompanyId(authentication);
        UUID userId = requireUserId(authentication);
        return ResponseEntity.ok(
                horecaRuleService.publishCurrentDraft(
                        companyId,
                        userId,
                        request,
                        TokenExtractor.extractAccessToken(httpServletRequest)
                )
        );
    }

    private UUID requireUserId(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            String claim = jwtAuth.getToken().getClaimAsString("userId");
            if (claim != null && !claim.isBlank()) {
                return UUID.fromString(claim.trim());
            }
        }
        throw new IllegalArgumentException("Missing userId");
    }

    private UUID requireCompanyId(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            String claim = jwtAuth.getToken().getClaimAsString("companyId");
            if (claim != null && !claim.isBlank()) {
                return UUID.fromString(claim.trim());
            }
        }
        throw new IllegalArgumentException("Missing companyId");
    }
}
