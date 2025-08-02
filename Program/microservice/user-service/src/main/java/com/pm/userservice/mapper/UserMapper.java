package com.pm.userservice.mapper;

import com.pm.userservice.dto.UserRequestDTO;
import com.pm.userservice.dto.UserResponseDTO;
import com.pm.userservice.model.User;
import user.events.UserRegisteredEvent;

import java.time.LocalDate;
import java.util.UUID;

public class UserMapper {
    public static UserResponseDTO toDTO(User user) {
        if (user == null) {
            return null;
        }
        UserResponseDTO dto = new UserResponseDTO();
        dto.setUserId(user.getUserId() != null ? user.getUserId().toString() : null);
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setRegisteredDate(user.getRegisteredDate() != null ? user.getRegisteredDate().toString() : null);
        dto.setName(user.getName());
        dto.setStreetName(user.getStreetName());
        dto.setHouseNumber(user.getHouseNumber());
        dto.setHouseNumberSuffix(user.getHouseNumberSuffix());
        dto.setPostalCode(user.getPostalCode());
        dto.setCity(user.getCity());
        dto.setCountry(user.getCountry());
        dto.setDateOfBirth(user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null);
        dto.setBankAccountNumber(user.getBankAccountNumber());
        dto.setPhoneNumber(user.getPhoneNumber());

        return dto;
    }

    public static User toModel(UserRegisteredEvent event) {
        if (event == null) {
            return null;
        }

        User user = new User();
        user.setUserId(UUID.fromString(event.getUserId()));
        user.setEmail(event.getEmail());
        user.setRole(event.getRole());
        user.setRegisteredDate(LocalDate.now());

        return user;
    }
}