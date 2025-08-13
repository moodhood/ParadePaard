// src/main/java/com/pm/authservice/mapper/RegisterMapper.java
package com.pm.authservice.mapper;

import com.pm.authservice.dto.RegisterRequestDTO;
import com.pm.authservice.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;

public final class RegisterMapper {

    private RegisterMapper() {}

    // pure mapper, no database work, no roles here
    public static User toModel(RegisterRequestDTO dto, PasswordEncoder encoder) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(encoder.encode(dto.getPassword()));
        // roles are set in the service
        return user;
    }
}
