package com.pm.userservice.controller;

import com.pm.userservice.dto.PlatformCompanyDetailDTO;
import com.pm.userservice.dto.PlatformCompanyListItemDTO;
import com.pm.userservice.dto.PlatformCompanyOnboardingRequestDTO;
import com.pm.userservice.dto.PlatformCompanyOnboardingResponseDTO;
import com.pm.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/platform/companies")
public class PlatformAdminController {
    private final UserService userService;

    public PlatformAdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "List all companies for platform admins")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLATFORM')")
    public ResponseEntity<List<PlatformCompanyListItemDTO>> listCompanies() {
        return ResponseEntity.ok(userService.listPlatformCompanies());
    }

    @GetMapping("/{companyId}")
    @Operation(summary = "Get one company summary for platform admins")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLATFORM')")
    public ResponseEntity<PlatformCompanyDetailDTO> getCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(userService.getPlatformCompany(companyId));
    }

    @PostMapping("/onboard")
    @Operation(summary = "Create a company and its first admin")
    @PreAuthorize("hasAuthority('CAN_MANAGE_PLATFORM')")
    public ResponseEntity<PlatformCompanyOnboardingResponseDTO> onboardCompany(
            @Valid @RequestBody PlatformCompanyOnboardingRequestDTO request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.onboardPlatformCompany(request));
    }
}
