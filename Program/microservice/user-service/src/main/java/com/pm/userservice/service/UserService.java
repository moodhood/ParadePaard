package com.pm.userservice.service;

import com.pm.userservice.dto.CompanyResponseDTO;
import com.pm.userservice.dto.UserRequestDTO;
import com.pm.userservice.dto.UserResponseDTO;
import com.pm.userservice.exception.UserNotFoundException;
import com.pm.userservice.mapper.UserMapper;
import com.pm.userservice.model.Company;
import com.pm.userservice.model.User;
import com.pm.userservice.repository.CompanyRepository;
import com.pm.userservice.repository.UserRepository;
import com.pm.userservice.validation.UserDuplicateValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final UserDuplicateValidator userDuplicateValidator;

    public record ProfilePicture(byte[] data, String contentType) {}

    public UserService(UserRepository userRepository,
                       CompanyRepository companyRepository,
                       UserDuplicateValidator userDuplicateValidator) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.userDuplicateValidator = userDuplicateValidator;
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getUsers(UUID companyId) {
        List<User> users = companyId != null
                ? userRepository.findAllByCompanyId(companyId)
                : userRepository.findAll();

        if (users.isEmpty()) {
            return List.of();
        }

        if (companyId != null) {
            Integer payoutFrequency = resolveCompanyPayoutFrequency(companyId);
            return users.stream()
                    .map(user -> UserMapper.toDTO(user, payoutFrequency))
                    .toList();
        }

        Set<UUID> companyIds = users.stream()
                .map(User::getCompanyId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());
        var payoutByCompany = resolveCompanyPayoutFrequencies(companyIds);
        return users.stream()
                .map(user -> UserMapper.toDTO(user, payoutByCompany.get(user.getCompanyId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(UUID id, UUID companyId) {
        User user = companyId != null
                ? userRepository.findByUserIdAndCompanyId(id, companyId)
                    .orElseThrow(() -> new UserNotFoundException("User with id: " + id + " not found"))
                : userRepository.findByUserId(id)
                    .orElseThrow(() -> new UserNotFoundException("User with id: " + id + " not found"));
        Integer payoutFrequency = user.getCompanyId() != null
                ? resolveCompanyPayoutFrequency(user.getCompanyId())
                : user.getPayslipFrequencyMinutes();
        return UserMapper.toDTO(user, payoutFrequency);
    }

    @Transactional
    public UserResponseDTO updateUser(UUID id, UserRequestDTO userRequestDTO, UUID companyId) {
        User existing = companyId != null
                ? userRepository.findByUserIdAndCompanyId(id, companyId)
                    .orElseThrow(() -> new UserNotFoundException("User with id: " + id + " not found"))
                : userRepository.findByUserId(id)
                    .orElseThrow(() -> new UserNotFoundException("User with id: " + id + " not found"));

        userDuplicateValidator.validateNoDuplicate(id, userRequestDTO);

        existing.setEmail(userRequestDTO.getEmail());
        existing.setPreferredName(userRequestDTO.getPreferredName());
        existing.setFirstNames(userRequestDTO.getFirstNames());
        existing.setMiddleNamePrefix(userRequestDTO.getMiddleNamePrefix());
        existing.setLastName(userRequestDTO.getLastName());
        existing.setGender(userRequestDTO.getGender());
        existing.setDateOfBirth(
                userRequestDTO.getDateOfBirth() != null
                        ? java.time.LocalDate.parse(userRequestDTO.getDateOfBirth())
                        : null
        );
        existing.setMobileNumber(userRequestDTO.getMobileNumber());
        existing.setStreet(userRequestDTO.getStreet());
        existing.setHouseNumber(userRequestDTO.getHouseNumber());
        existing.setHouseNumberSuffix(userRequestDTO.getHouseNumberSuffix());
        existing.setPostalCode(userRequestDTO.getPostalCode());
        existing.setCity(userRequestDTO.getCity());
        existing.setCountry(userRequestDTO.getCountry());
        existing.setIban(userRequestDTO.getIban());

        User updatedUser = userRepository.save(existing);
        Integer payoutFrequency = updatedUser.getCompanyId() != null
                ? resolveCompanyPayoutFrequency(updatedUser.getCompanyId())
                : updatedUser.getPayslipFrequencyMinutes();
        return UserMapper.toDTO(updatedUser, payoutFrequency);
    }

    @Transactional
    public UserResponseDTO updateCompanyPayoutFrequency(UUID userId, UUID companyId, int minutes) {
        if (companyId == null) {
            throw new IllegalArgumentException("Missing company");
        }
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalStateException("Company not found"));
        company.setPayoutFrequencyMinutes(minutes);
        companyRepository.save(company);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException("User with id: " + userId + " not found"));
        Integer payoutFrequency = company.getPayoutFrequencyMinutes();
        return UserMapper.toDTO(user, payoutFrequency);
    }

    @Transactional(readOnly = true)
    public CompanyResponseDTO getCompany(UUID companyId) {
        if (companyId == null) {
            throw new IllegalArgumentException("Missing company");
        }
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalStateException("Company not found"));
        CompanyResponseDTO dto = new CompanyResponseDTO();
        dto.setCompanyId(company.getId().toString());
        dto.setName(company.getName());
        return dto;
    }

    @Transactional
    public CompanyResponseDTO updateCompanyName(UUID companyId, String name) {
        if (companyId == null) {
            throw new IllegalArgumentException("Missing company");
        }
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isBlank()) {
            throw new IllegalArgumentException("Company name is required");
        }
        Optional<Company> existingByName = companyRepository.findByName(trimmed);
        if (existingByName.isPresent() && !existingByName.get().getId().equals(companyId)) {
            throw new IllegalArgumentException("Company name already exists");
        }
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalStateException("Company not found"));
        company.setName(trimmed);
        companyRepository.save(company);
        CompanyResponseDTO dto = new CompanyResponseDTO();
        dto.setCompanyId(company.getId().toString());
        dto.setName(company.getName());
        return dto;
    }

    @Transactional(readOnly = true)
    public Optional<ProfilePicture> getProfilePicture(UUID id) {
        User user = userRepository.findByUserId(id)
                .orElseThrow(() -> new UserNotFoundException("User with id: " + id + " not found"));
        byte[] data = user.getProfilePicture();
        if (data == null || data.length == 0) return Optional.empty();
        return Optional.of(new ProfilePicture(data, user.getProfilePictureContentType()));
    }

    @Transactional
    public void updateProfilePicture(UUID id, byte[] data, String contentType) {
        User user = userRepository.findByUserId(id)
                .orElseThrow(() -> new UserNotFoundException("User with id: " + id + " not found"));
        user.setProfilePicture(data);
        user.setProfilePictureContentType(contentType);
        userRepository.save(user);
    }

    @Transactional
    public void removeProfilePicture(UUID id) {
        User user = userRepository.findByUserId(id)
                .orElseThrow(() -> new UserNotFoundException("User with id: " + id + " not found"));
        user.setProfilePicture(null);
        user.setProfilePictureContentType(null);
        userRepository.save(user);
    }

    public void deleteUser(UUID id, UUID companyId) {
        if (companyId != null) {
            User user = userRepository.findByUserIdAndCompanyId(id, companyId)
                    .orElseThrow(() -> new UserNotFoundException("User with id: " + id + " not found"));
            userRepository.deleteByUserId(user.getUserId());
            return;
        }
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User with id: " + id + " not found");
        }
        userRepository.deleteByUserId(id);
    }

    private Integer resolveCompanyPayoutFrequency(UUID companyId) {
        return companyRepository.findById(companyId)
                .map(Company::getPayoutFrequencyMinutes)
                .orElse(null);
    }

    private java.util.Map<UUID, Integer> resolveCompanyPayoutFrequencies(Set<UUID> companyIds) {
        if (companyIds == null || companyIds.isEmpty()) {
            return new HashMap<>();
        }
        return companyRepository.findAllById(companyIds).stream()
                .collect(Collectors.toMap(Company::getId, Company::getPayoutFrequencyMinutes));
    }
}
