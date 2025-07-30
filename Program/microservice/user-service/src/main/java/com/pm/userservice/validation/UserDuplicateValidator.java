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

    public void validateUniqueFields(UUID currentId, UserRequestDTO dto) {

        if (userRepository.existsByEmailAndIdNot(dto.getEmail(), currentId)) {
            throw new EmailAlreadyExistsException(
                    "Email already exists " + dto.getEmail());
        }

        if (userRepository.existsByBankAccountNumberAndIdNot(
                dto.getBankAccountNumber(), currentId)) {
            throw new BankAccountNumberAlreadyExistsException(
                    "Bank account number already exists " + dto.getBankAccountNumber());
        }

        if (userRepository.existsByPhoneNumberAndIdNot(
                dto.getPhoneNumber(), currentId)) {
            throw new PhoneNumberAlreadyExistsException(
                    "Phone number already exists " + dto.getPhoneNumber());
        }
    }
}
