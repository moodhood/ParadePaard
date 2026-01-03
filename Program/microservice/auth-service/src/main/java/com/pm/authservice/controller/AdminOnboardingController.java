package com.pm.authservice.controller;

import com.pm.authservice.dto.AdminOnboardUserRequestDTO;
import com.pm.authservice.dto.AdminOnboardUserResponseDTO;
import com.pm.authservice.service.AdminOnboardingService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
public class AdminOnboardingController {
    private final AdminOnboardingService adminOnboardingService;

    public AdminOnboardingController(AdminOnboardingService adminOnboardingService) {
        this.adminOnboardingService = adminOnboardingService;
    }

    @Operation(summary = "Admin creates a new user and sends onboarding email")
    @PostMapping("/onboard-user")
    public ResponseEntity<AdminOnboardUserResponseDTO> onboardUser(@Valid @RequestBody AdminOnboardUserRequestDTO body) {
        return ResponseEntity.ok(adminOnboardingService.onboardUser(body));
    }
}

