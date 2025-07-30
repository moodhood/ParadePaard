package com.pm.userservice.service;

import com.pm.userservice.dto.UserRequestDTO;
import com.pm.userservice.dto.UserResponseDTO;
import com.pm.userservice.exception.UserNotFoundException;
import com.pm.userservice.mapper.UserMapper;
import com.pm.userservice.model.User;
import com.pm.userservice.repository.UserRepository;
import com.pm.userservice.validation.UserDuplicateValidator;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {
    final private UserRepository userRepository;
    final private UserDuplicateValidator userDuplicateValidator;

    public UserService(UserRepository userRepository, UserDuplicateValidator userDuplicateValidator) {
        this.userRepository = userRepository;
        this.userDuplicateValidator = userDuplicateValidator;
    }

    public List<UserResponseDTO> getUser() {
        List<User> users = userRepository.findAll();
        return users.stream().map(UserMapper::toDTO).toList();
    }

    public UserResponseDTO updateUser(UUID id, UserRequestDTO userRequestDTO) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("Patient with id: " + id + " not found"));

        userDuplicateValidator.validateUniqueFields(id, userRequestDTO);

        user.setName(userRequestDTO.getName());
        user.setEmail(userRequestDTO.getEmail());
        user.setAddress(userRequestDTO.getAddress());
        user.setDateOfBirth(LocalDate.parse(userRequestDTO.getDateOfBirth()));
        user.setPhoneNumber(userRequestDTO.getPhoneNumber());
        user.setBankAccountNumber(userRequestDTO.getBankAccountNumber());

        User updatedPatient = userRepository.save(user);
        return UserMapper.toDTO(updatedPatient);
    }

    public void deleteUser(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("Patient with id: " + id + " not found"));
        userRepository.deleteById(id);
    }
}