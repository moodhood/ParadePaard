package com.pm.userservice.validation;

import com.pm.userservice.dto.UserRequestDTO;
import com.pm.userservice.exception.BankAccountNumberAlreadyExistsException;
import com.pm.userservice.exception.EmailAlreadyExistsException;
import com.pm.userservice.exception.PhoneNumberAlreadyExistsException;
import com.pm.userservice.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class UserDuplicateValidator {

    private final UserRepository userRepository;

    public UserDuplicateValidator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void validateNoDuplicate(UUID currentId, UserRequestDTO userRequestDTO) {

        if (userRepository.existsByEmailAndUserIdNot(userRequestDTO.getEmail(), currentId)) {
            throw new EmailAlreadyExistsException(
                    "Email already exists " + userRequestDTO.getEmail());
        }

        if (userRepository.existsByBankAccountNumberAndUserIdNot(
                userRequestDTO.getBankAccountNumber(), currentId)) {
            throw new BankAccountNumberAlreadyExistsException(
                    "Bank account number already exists " + userRequestDTO.getBankAccountNumber());
        }

        if (userRepository.existsByPhoneNumberAndUserIdNot(
                userRequestDTO.getPhoneNumber(), currentId)) {
            throw new PhoneNumberAlreadyExistsException(
                    "Phone number already exists " + userRequestDTO.getPhoneNumber());
        }
    }
}
