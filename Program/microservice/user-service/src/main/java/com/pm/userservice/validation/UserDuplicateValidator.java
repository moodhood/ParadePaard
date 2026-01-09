package com.pm.userservice.validation;

import com.pm.userservice.dto.UserRequestDTO;
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

    public void validateNoDuplicate(UUID currentId, UUID companyId, UserRequestDTO userRequestDTO) {
        String email = userRequestDTO.getEmail();
        if (email != null && companyId != null
                && userRepository.existsByEmailAndCompanyIdAndUserIdNot(email, companyId, currentId)) {
            throw new EmailAlreadyExistsException(
                    "Email already exists " + email);
        }

        if (email != null && companyId == null
                && userRepository.existsByEmailAndUserIdNot(email, currentId)) {
            throw new EmailAlreadyExistsException(
                    "Email already exists " + email);
        }

        if (userRequestDTO.getMobileNumber() != null
                && userRepository.existsByMobileNumberAndUserIdNot(
                userRequestDTO.getMobileNumber(), currentId)) {
            throw new PhoneNumberAlreadyExistsException(
                    "Phone number already exists " + userRequestDTO.getMobileNumber());
        }
    }
}
