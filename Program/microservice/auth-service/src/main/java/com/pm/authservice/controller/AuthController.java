package com.pm.authservice.controller;

import com.pm.authservice.dto.*;
import com.pm.authservice.service.AuthService;
import com.pm.authservice.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
public class AuthController {
    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @Operation(summary = "Register new user and return access token")
    @PostMapping(value = {"/register", "/register/"})
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO registerRequestDTO) {
        return authService.register(registerRequestDTO);
    }

    @Operation(summary = "Generate access token on user login")
    @PostMapping(value = {"/login", "/login/"})
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        return authService.authenticate(loginRequestDTO);
    }

    @Operation(summary = "Generate new access token using refresh token cookie")
    @PostMapping(value = {"/refresh", "/refresh/"})
    public ResponseEntity<AuthResponseDTO> refreshToken(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String refreshToken = authorizationHeader.substring(7);

        return authService.refreshToken(refreshToken);
    }

    @Operation(summary = "Validate Token")
    @GetMapping({"/validate", "/validate/"})
    public ResponseEntity<Void> validateToken(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authorizationHeader.substring(7);

        boolean valid = authService.validateToken(token);
        return valid
                ? ResponseEntity.ok().build()
                : ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @Operation(summary = "Update User Roles")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/users/{id}/roles")
    public ResponseEntity<Void> setUserRoles(@PathVariable("id") UUID userId,
                                             @Valid @RequestBody UpdateUserRequestDTO body) {
        authService.setUserRoles(userId, body.getRoles());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Logout user by clearing tokens")
    @PostMapping(value = {"/logout", "/logout/"})
    public ResponseEntity<Void> logout() {
        return authService.logout();
    }

    @Operation(summary = "Request a password reset email (always returns 204)")
    @PostMapping(value = {"/forgot-password", "/forgot-password/"})
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO body) {
        return passwordResetService.requestPasswordReset(body.getEmail());
    }

    @Operation(summary = "Reset password using a one-time token")
    @PostMapping(value = {"/reset-password", "/reset-password/"})
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO body) {
        return passwordResetService.resetPassword(body.getToken(), body.getNewPassword());
    }

    @Operation(summary = "Check if user is ADMIN")
    @GetMapping("/is-admin")
    public ResponseEntity<Boolean> isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));

        return ResponseEntity.ok(isAdmin);
    }

}

