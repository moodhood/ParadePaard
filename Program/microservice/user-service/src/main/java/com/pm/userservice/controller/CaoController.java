package com.pm.userservice.controller;

import com.pm.userservice.dto.CaoTemplateCreateDTO;
import com.pm.userservice.dto.CaoTemplateDTO;
import com.pm.userservice.service.CaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/cao")
@Tag(name = "CAO", description = "API for managing CAO (Collective Labor Agreement) templates")
public class CaoController {

    private final CaoService caoService;

    public CaoController(CaoService caoService) {
        this.caoService = caoService;
    }

    private UUID resolveCompanyId(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            String claim = jwtAuth.getToken().getClaimAsString("companyId");
            if (claim != null && !claim.isBlank()) {
                return UUID.fromString(claim.trim());
            }
        }
        return null;
    }

    @GetMapping
    @Operation(summary = "List all CAO templates for the current company")
    @PreAuthorize("hasAuthority('CAN_MANAGE_COMPANY')")
    public ResponseEntity<List<CaoTemplateDTO>> getCaoTemplates(Authentication authentication) {
        UUID companyId = resolveCompanyId(authentication);
        if (companyId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(caoService.getCaoTemplates(companyId));
    }

    @GetMapping("/{caoId}")
    @Operation(summary = "Get a CAO template by id")
    @PreAuthorize("hasAuthority('CAN_MANAGE_COMPANY') or hasAuthority('CAN_REVIEW_ONBOARDING')")
    public ResponseEntity<?> getCaoTemplateById(@PathVariable UUID caoId, Authentication authentication) {
        UUID companyId = resolveCompanyId(authentication);
        if (companyId == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(caoService.getCaoTemplateById(caoId, companyId));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @Operation(summary = "Create a new CAO template")
    @PreAuthorize("hasAuthority('CAN_MANAGE_COMPANY')")
    public ResponseEntity<?> createCaoTemplate(
            @Valid @RequestBody CaoTemplateCreateDTO body,
            Authentication authentication
    ) {
        UUID companyId = resolveCompanyId(authentication);
        if (companyId == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(caoService.createCaoTemplate(companyId, body));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/{caoId}")
    @Operation(summary = "Update a CAO template")
    @PreAuthorize("hasAuthority('CAN_MANAGE_COMPANY')")
    public ResponseEntity<?> updateCaoTemplate(
            @PathVariable UUID caoId,
            @Valid @RequestBody CaoTemplateCreateDTO body,
            Authentication authentication
    ) {
        UUID companyId = resolveCompanyId(authentication);
        if (companyId == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(caoService.updateCaoTemplate(caoId, companyId, body));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/{caoId}")
    @Operation(summary = "Delete a CAO template")
    @PreAuthorize("hasAuthority('CAN_MANAGE_COMPANY')")
    public ResponseEntity<?> deleteCaoTemplate(@PathVariable UUID caoId, Authentication authentication) {
        UUID companyId = resolveCompanyId(authentication);
        if (companyId == null) return ResponseEntity.status(401).build();
        try {
            caoService.deleteCaoTemplate(caoId, companyId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
