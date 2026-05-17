package com.pm.userservice.controller;

import com.pm.userservice.dto.UserSetupRequestDTO;
import com.pm.userservice.security.TokenExtractor;
import com.pm.userservice.service.OnboardingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/user")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @PostMapping("/setup")
    @PreAuthorize("hasAuthority('CAN_COMPLETE_ONBOARDING')")
    public ResponseEntity<Void> setup(@Valid @RequestBody UserSetupRequestDTO request,
                                      Authentication authentication,
                                      HttpServletRequest httpServletRequest) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        UUID userId = UUID.fromString(authentication.getName());
        String accessToken = TokenExtractor.extractAccessToken(httpServletRequest);
        onboardingService.completeUserSetup(userId, request, accessToken);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/setup/id-document-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('CAN_COMPLETE_ONBOARDING')")
    public ResponseEntity<Void> uploadIdDocumentImage(@RequestPart("file") MultipartFile file,
                                                      Authentication authentication) throws IOException {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        UUID userId = UUID.fromString(authentication.getName());
        onboardingService.updateIdDocumentImage(userId, file.getBytes(), file.getContentType());
        return ResponseEntity.ok().build();
    }
}
