package com.pm.authservice.mapper;

import com.pm.authservice.dto.RegisterRequestDTO;
import com.pm.authservice.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;

public final class RegisterMapper {

    private RegisterMapper() {}

    public static User toModel(RegisterRequestDTO dto, PasswordEncoder encoder) {
        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPassword(encoder.encode(dto.getPassword()));
        return user;
    }
}