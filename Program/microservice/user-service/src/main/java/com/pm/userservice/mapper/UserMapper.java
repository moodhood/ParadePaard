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

    public static User toModel(UserRequestDTO userRequestDTO) {
        if (userRequestDTO == null) {
            return null;
        }

        User user = new User();
        user.setEmail(userRequestDTO.getEmail());
        user.setName(userRequestDTO.getName());
        user.setStreetName(userRequestDTO.getStreetName());
        user.setHouseNumber(userRequestDTO.getHouseNumber());
        user.setHouseNumberSuffix(userRequestDTO.getHouseNumberSuffix());
        user.setPostalCode(userRequestDTO.getPostalCode());
        user.setCity(userRequestDTO.getCity());
        user.setCountry(userRequestDTO.getCountry());
        user.setDateOfBirth(userRequestDTO.getDateOfBirth() != null ? LocalDate.parse(userRequestDTO.getDateOfBirth()) : null);
        user.setBankAccountNumber(userRequestDTO.getBankAccountNumber());
        user.setPhoneNumber(userRequestDTO.getPhoneNumber());

        return user;
    }

    public static User toModelUserRegisteredEvent(UserRegisteredEvent event) {
        if (event == null) {
            return null;
        }

        User user = new User();
        user.setUserId(UUID.fromString(event.getUserId()));
        user.setEmail(event.getEmail());
        user.setRegisteredDate(LocalDate.now());

        return user;
    }
}