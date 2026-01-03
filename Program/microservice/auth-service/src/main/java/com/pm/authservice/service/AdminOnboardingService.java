package com.pm.authservice.service;

import com.pm.authservice.dto.AdminOnboardUserRequestDTO;
import com.pm.authservice.dto.AdminOnboardUserResponseDTO;
import com.pm.authservice.exception.EmailAlreadyExistsException;
import com.pm.authservice.exception.RoleDoesNotExistException;
import com.pm.authservice.kafka.KafkaProducer;
import com.pm.authservice.model.Role;
import com.pm.authservice.model.User;
import com.pm.authservice.repository.RoleRepository;
import com.pm.authservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class AdminOnboardingService {
    private static final Logger log = LoggerFactory.getLogger(AdminOnboardingService.class);

    private static final int TEMP_PASSWORD_LENGTH = 12;
    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final KafkaProducer kafkaProducer;
    private final PasswordResetService passwordResetService;
    private final EmailSender emailSender;

    public AdminOnboardingService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            KafkaProducer kafkaProducer,
            PasswordResetService passwordResetService,
            EmailSender emailSender
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.kafkaProducer = kafkaProducer;
        this.passwordResetService = passwordResetService;
        this.emailSender = emailSender;
    }

    @Transactional
    public AdminOnboardUserResponseDTO onboardUser(AdminOnboardUserRequestDTO request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("A user with this email already exists " + email);
        }

        String firstName = request.getFirstName() == null ? "" : request.getFirstName().trim();
        String lastName = request.getLastName() == null ? "" : request.getLastName().trim();
        String usernameBase = normalizeUsername(firstName + "." + lastName);
        String username = ensureUniqueUsername(usernameBase);
        String tempPassword = generateTemporaryPassword();

        User user = new User();
        user.setFirstName(firstName.isBlank() ? "User" : firstName);
        user.setLastName(lastName.isBlank() ? "Unknown" : lastName);
        user.setEmail(email);
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setMustChangePassword(true);

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RoleDoesNotExistException("USER role is missing seed it first"));
        user.setRoles(List.of(userRole));

        User saved = userRepository.save(user);
        kafkaProducer.sendEvent(saved);

        passwordResetService.issueResetToken(saved).ifPresentOrElse(issued -> {
            try {
                emailSender.sendEmployeeOnboardingEmail(email, username, tempPassword, issued.getResetUrl(), issued.getTtl());
            } catch (Exception e) {
                log.error("Failed to send onboarding email userId={} email={}", saved.getId(), email, e);
            }
        }, () -> log.error("Failed to issue password reset token for userId={}", saved.getId()));

        AdminOnboardUserResponseDTO response = new AdminOnboardUserResponseDTO();
        response.setUserId(saved.getId().toString());
        response.setEmail(saved.getEmail());
        response.setUsername(saved.getUsername());
        response.setTemporaryPassword(tempPassword);
        return response;
    }

    private String ensureUniqueUsername(String base) {
        String normalized = normalizeUsername(base);
        if (!userRepository.existsByUsername(normalized)) {
            return normalized;
        }

        for (int i = 2; i <= 9999; i++) {
            String candidate = normalized + i;
            if (!userRepository.existsByUsername(candidate)) {
                return candidate;
            }
        }

        throw new IllegalStateException("Unable to generate a unique username for base=" + normalized);
    }

    private static String normalizeEmail(String rawEmail) {
        return rawEmail == null ? "" : rawEmail.trim().toLowerCase(Locale.ROOT);
    }

    private static String normalizeUsername(String rawUsername) {
        String s = rawUsername == null ? "" : rawUsername.trim();
        s = WHITESPACE.matcher(s).replaceAll(".");
        s = s.toLowerCase(Locale.ROOT);
        s = s.replaceAll("\\.+", ".");
        s = s.replaceAll("^\\.+|\\.+$", "");
        return s.isBlank() ? "user" : s;
    }

    private static String generateTemporaryPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(TEMP_PASSWORD_LENGTH);
        for (int i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
            sb.append(PASSWORD_CHARS.charAt(random.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }
}

