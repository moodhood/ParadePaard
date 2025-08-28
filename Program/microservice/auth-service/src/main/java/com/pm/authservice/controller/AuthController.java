// src/main/java/com/pm/authservice/controller/AuthController.java
package com.pm.authservice.controller;

import com.pm.authservice.dto.*;
import com.pm.authservice.repository.RoleRepository;
import com.pm.authservice.repository.UserRepository;
import com.pm.authservice.service.AuthService;
import com.pm.authservice.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "*")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @Operation(summary = "Register new user and return access token")
    @PostMapping(value = {"/register", "/register/"})
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO registerRequestDTO) {
        AuthResponseDTO authResponseDTO = authService.register(registerRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponseDTO);
    }

    @Operation(summary = "Generate access token on user login")
    @PostMapping(value = {"/login", "/login/"})
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO loginRequestDTO){
        Optional<AuthResponseDTO> authResponseDTO = authService.authenticate(loginRequestDTO);
        if(authResponseDTO.isEmpty()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.of(authResponseDTO);
    }

    @Operation(summary = "Generate access with refresh token")
    @PostMapping(value = {"/refresh"})
    public ResponseEntity<AuthResponseDTO> refreshToken(@RequestBody RefreshTokenRequestDTO refreshTokenRequestDTO){
        String refreshToken = refreshTokenRequestDTO.getRefreshToken();
        if (authService.validateToken(refreshToken)){
            String newAccessToken = jwtUtil.generateAccessToken(
                    jwtUtil.extractEmail(refreshToken),
                    jwtUtil.extractClaims(refreshToken).getId(),
                    jwtUtil.extractRoles(refreshToken));

            AuthResponseDTO authResponseDTO = new AuthResponseDTO();
            authResponseDTO.setAccessToken(newAccessToken);
            authResponseDTO.setRefreshToken(refreshToken);
            return ResponseEntity.ok(authResponseDTO);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @Operation(summary = "Validate Token")
    @GetMapping(value = {"/validate", "/validate/"})
    public ResponseEntity<Void> validateToken(@RequestHeader("Authorization") String authHeader){
        if(authHeader == null || !authHeader.startsWith("Bearer ")){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return authService.validateToken(authHeader.substring(7))
                ? ResponseEntity.ok().build()
                : ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @Operation(summary = "Update User Roles")
    @PreAuthorize("hasRole('ADMIN')")  // Use hasRole instead of hasAuthority
    @PutMapping("/admin/users/{id}/roles")
    public ResponseEntity<Void> setUserRoles(@PathVariable("id") UUID userId,
                                             @Valid @RequestBody UpdateUserRequestDTO body) {
        authService.setUserRoles(userId, body.getRoles());
        return ResponseEntity.noContent().build();
    }
}