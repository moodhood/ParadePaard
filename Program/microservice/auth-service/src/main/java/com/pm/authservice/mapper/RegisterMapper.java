package com.pm.authservice.mapper;

import com.pm.authservice.dto.RegisterRequestDTO;
import com.pm.authservice.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;

public final class RegisterMapper {

    private RegisterMapper() {}

    public static User toModel(RegisterRequestDTO dto, PasswordEncoder encoder) {
        User user = new User();
        user.setFirstName(normalizeName(dto.getFirstName(), "User"));
        user.setLastName(normalizeName(dto.getLastName(), "Unknown"));
        user.setEmail(dto.getEmail());
        user.setPassword(encoder.encode(dto.getPassword()));
        return user;
    }

    private static String normalizeName(String value, String fallback) {
        if (value == null) {
            return fallback;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? fallback : trimmed;
    }
}
