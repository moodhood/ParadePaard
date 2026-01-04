package com.pm.userservice.mapper;

import com.pm.userservice.dto.UserRequestDTO;
import com.pm.userservice.dto.UserResponseDTO;
import com.pm.userservice.model.User;
import com.pm.userservice.model.UserStatus;
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
        dto.setPreferredName(user.getPreferredName());
        dto.setFirstNames(user.getFirstNames());
        dto.setMiddleNamePrefix(user.getMiddleNamePrefix());
        dto.setLastName(user.getLastName());
        dto.setGender(user.getGender());
        dto.setDateOfBirth(user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null);
        dto.setMobileNumber(user.getMobileNumber());
        dto.setPosition(user.getPosition());
        dto.setWorkedForUsBefore(user.isWorkedForUsBefore());
        dto.setStreet(user.getStreet());
        dto.setHouseNumber(user.getHouseNumber());
        dto.setHouseNumberSuffix(user.getHouseNumberSuffix());
        dto.setPostalCode(user.getPostalCode());
        dto.setCity(user.getCity());
        dto.setCountry(user.getCountry());
        dto.setIban(user.getIban());
        dto.setPayslipFrequencyMinutes(user.getPayslipFrequencyMinutes());
        dto.setStatus(user.getStatus() != null ? user.getStatus().name() : null);

        return dto;
    }

    public static User toModel(UserRequestDTO userRequestDTO) {
        if (userRequestDTO == null) {
            return null;
        }

        User user = new User();
        user.setEmail(userRequestDTO.getEmail());
        user.setPreferredName(userRequestDTO.getPreferredName());
        user.setFirstNames(userRequestDTO.getFirstNames());
        user.setMiddleNamePrefix(userRequestDTO.getMiddleNamePrefix());
        user.setLastName(userRequestDTO.getLastName());
        user.setGender(userRequestDTO.getGender());
        user.setDateOfBirth(userRequestDTO.getDateOfBirth() != null ? LocalDate.parse(userRequestDTO.getDateOfBirth()) : null);
        user.setMobileNumber(userRequestDTO.getMobileNumber());
        user.setStreet(userRequestDTO.getStreet());
        user.setHouseNumber(userRequestDTO.getHouseNumber());
        user.setHouseNumberSuffix(userRequestDTO.getHouseNumberSuffix());
        user.setPostalCode(userRequestDTO.getPostalCode());
        user.setCity(userRequestDTO.getCity());
        user.setCountry(userRequestDTO.getCountry());
        user.setIban(userRequestDTO.getIban());

        return user;
    }

    public static User toModelUserRegisteredEvent(UserRegisteredEvent event) {
        if (event == null) {
            return null;
        }

        User user = new User();
        user.setUserId(UUID.fromString(event.getUserId()));
        user.setEmail(event.getEmail());
        user.setStatus(UserStatus.ACTIVE);

        return user;
    }
}
