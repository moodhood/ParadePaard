package com.pm.authservice.service;

import com.pm.authservice.model.PasswordResetToken;
import com.pm.authservice.model.User;
import com.pm.authservice.repository.PasswordResetTokenRepository;
import com.pm.authservice.repository.UserRepository;
import com.pm.authservice.util.PasswordResetTokenUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {
    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailSender emailSender;
    private final Duration tokenTtl;
    private final String frontendResetUrl;
    private final String hmacSecret;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            EmailSender emailSender,
            @Value("${password-reset.token-ttl:PT15M}") Duration tokenTtl,
            @Value("${password-reset.frontend-reset-url:http://localhost:5173/reset-password}") String frontendResetUrl,
            @Value("${password-reset.hmac-secret:}") String hmacSecret
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailSender = emailSender;
        this.tokenTtl = tokenTtl;
        this.frontendResetUrl = frontendResetUrl;
        this.hmacSecret = (hmacSecret == null) ? "" : hmacSecret.trim();
    }

    public ResponseEntity<Void> requestPasswordReset(String rawEmail) {
        String email = normalizeEmail(rawEmail);

        tokenRepository.deleteAllByExpiresAtBefore(Instant.now());

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        if (hmacSecret.isBlank()) {
            log.error("password-reset.hmac-secret is not configured; refusing to issue password reset tokens");
            return ResponseEntity.internalServerError().build();
        }

        User user = userOpt.get();
        tokenRepository.deleteAllByUserIdAndUsedAtIsNull(user.getId());

        String token = PasswordResetTokenUtil.generateToken();
        String tokenHash = PasswordResetTokenUtil.hmacSha256Hex(hmacSecret, token);

        Instant now = Instant.now();
        PasswordResetToken row = new PasswordResetToken();
        row.setUserId(user.getId());
        row.setTokenHash(tokenHash);
        row.setCreatedAt(now);
        row.setExpiresAt(now.plus(tokenTtl));
        tokenRepository.save(row);

        String resetUrl = UriComponentsBuilder
                .fromUriString(frontendResetUrl)
                .queryParam("token", token)
                .build()
                .toUriString();

        try {
            emailSender.sendPasswordResetEmail(user.getEmail(), resetUrl, tokenTtl);
        } catch (Exception e) {
            log.error("Failed to send password reset email", e);
        }

        return ResponseEntity.noContent().build();
    }

    public ResponseEntity<Void> resetPassword(String rawToken, String newPassword) {
        if (hmacSecret.isBlank()) {
            return ResponseEntity.internalServerError().build();
        }

        String token = (rawToken == null) ? "" : rawToken.trim();
        if (token.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String tokenHash = PasswordResetTokenUtil.hmacSha256Hex(hmacSecret, token);
        Optional<PasswordResetToken> rowOpt = tokenRepository.findByTokenHash(tokenHash);
        if (rowOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        PasswordResetToken row = rowOpt.get();
        Instant now = Instant.now();
        if (row.getExpiresAt().isBefore(now) || row.getUsedAt() != null) {
            return ResponseEntity.badRequest().build();
        }

        UUID userId = row.getUserId();
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        row.setUsedAt(now);
        tokenRepository.save(row);
        tokenRepository.deleteAllByUserIdAndTokenHashNot(userId, tokenHash);

        return ResponseEntity.noContent().build();
    }

    private static String normalizeEmail(String email) {
        if (email == null) return "";
        return email.trim().toLowerCase();
    }
}
