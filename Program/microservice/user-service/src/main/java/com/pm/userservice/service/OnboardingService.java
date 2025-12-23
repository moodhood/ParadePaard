package com.pm.userservice.service;

import com.pm.userservice.dto.AdminOnboardingRequestDTO;
import com.pm.userservice.dto.AdminOnboardingResponseDTO;
import com.pm.userservice.dto.AuthRegisterRequestDTO;
import com.pm.userservice.dto.AuthRegisterResponseDTO;
import com.pm.userservice.dto.ContractDraftRequestDTO;
import com.pm.userservice.dto.ContractDraftResponseDTO;
import com.pm.userservice.dto.UserSetupRequestDTO;
import com.pm.userservice.exception.UserNotFoundException;
import com.pm.userservice.grpc.AuthServiceGrpcClient;
import com.pm.userservice.integration.AuthServiceClient;
import com.pm.userservice.integration.ContractServiceClient;
import com.pm.userservice.model.User;
import com.pm.userservice.model.UserStatus;
import com.pm.userservice.repository.UserRepository;
import com.pm.userservice.service.events.NotificationEventPublisher;
import com.pm.userservice.service.events.UserCreatedEvent;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Locale;
import java.util.UUID;

@Service
public class OnboardingService {

    private static final int TEMP_PASSWORD_LENGTH = 12;
    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    private final UserRepository userRepository;
    private final AuthServiceClient authServiceClient;
    private final ContractServiceClient contractServiceClient;
    private final AuthServiceGrpcClient authServiceGrpcClient;
    private final NotificationEventPublisher notificationEventPublisher;

    public OnboardingService(UserRepository userRepository,
                             AuthServiceClient authServiceClient,
                             ContractServiceClient contractServiceClient,
                             AuthServiceGrpcClient authServiceGrpcClient,
                             NotificationEventPublisher notificationEventPublisher) {
        this.userRepository = userRepository;
        this.authServiceClient = authServiceClient;
        this.contractServiceClient = contractServiceClient;
        this.authServiceGrpcClient = authServiceGrpcClient;
        this.notificationEventPublisher = notificationEventPublisher;
    }

    @Transactional
    public AdminOnboardingResponseDTO adminOnboard(AdminOnboardingRequestDTO request, String accessToken) {
        String fullName = buildFullName(request);
        String usernameBase = generateUsername(fullName);
        String tempPassword = generateTemporaryPassword();

        AuthRegisterRequestDTO registerRequest = new AuthRegisterRequestDTO();
        registerRequest.setEmail(request.getEmail());
        registerRequest.setFullName(fullName);
        registerRequest.setPassword(tempPassword);

        AuthRegisterResponseDTO authResponse = authServiceClient.register(registerRequest);
        if (authResponse == null || StringUtils.isBlank(authResponse.getUserId())) {
            throw new IllegalStateException("Auth service did not return a userId");
        }

        UUID userId = UUID.fromString(authResponse.getUserId());

        User user = new User();
        user.setUserId(userId);
        user.setEmail(request.getEmail());
        user.setPreferredName(request.getPreferredName());
        user.setFirstNames(request.getFirstNames());
        user.setMiddleNamePrefix(request.getMiddleNamePrefix());
        user.setLastName(request.getLastName());
        user.setGender(request.getGender());
        user.setDateOfBirth(request.getDateOfBirth() != null ? java.time.LocalDate.parse(request.getDateOfBirth()) : null);
        user.setMobileNumber(request.getMobileNumber());
        user.setStatus(UserStatus.PENDING_SETUP);
        userRepository.save(user);

        ContractDraftRequestDTO contractRequest = new ContractDraftRequestDTO();
        contractRequest.setUserId(userId.toString());
        contractRequest.setStartDate(request.getStartDate());
        contractRequest.setEndDate(request.getEndDate());
        contractRequest.setContractType(request.getContractType());
        contractRequest.setGrossHourlyWage(request.getGrossHourlyWage());
        contractRequest.setTravelAllowance(request.getTravelAllowance());

        ContractDraftResponseDTO contractResponse = contractServiceClient.createDraftContract(contractRequest, accessToken);

        UserCreatedEvent event = new UserCreatedEvent();
        event.setUserId(userId.toString());
        event.setEmail(request.getEmail());
        event.setUsername(usernameBase);
        event.setTemporaryPassword(tempPassword);
        notificationEventPublisher.publishUserCreated(event);

        AdminOnboardingResponseDTO response = new AdminOnboardingResponseDTO();
        response.setUserId(userId.toString());
        response.setContractId(contractResponse != null ? contractResponse.getContractId() : null);
        response.setUsername(usernameBase);
        response.setTemporaryPassword(tempPassword);
        return response;
    }

    @Transactional
    public void completeUserSetup(UUID userId, UserSetupRequestDTO request, String accessToken) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException("User " + userId + " not found"));

        user.setStreet(request.getStreet());
        user.setHouseNumber(request.getHouseNumber());
        user.setHouseNumberSuffix(request.getHouseNumberSuffix());
        user.setPostalCode(request.getPostalCode());
        user.setCity(request.getCity());
        user.setCountry(request.getCountry());
        user.setIban(request.getIban());

        authServiceGrpcClient.updatePassword(userId.toString(), request.getPassword());

        contractServiceClient.finalizeContract(accessToken);

        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    private static String buildFullName(AdminOnboardingRequestDTO request) {
        StringBuilder sb = new StringBuilder();
        if (StringUtils.isNotBlank(request.getFirstNames())) {
            sb.append(request.getFirstNames().trim());
        }
        if (StringUtils.isNotBlank(request.getMiddleNamePrefix())) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(request.getMiddleNamePrefix().trim());
        }
        if (StringUtils.isNotBlank(request.getLastName())) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(request.getLastName().trim());
        }
        String fullName = sb.toString();
        if (StringUtils.isBlank(fullName)) {
            throw new IllegalArgumentException("Full name required to generate username");
        }
        return fullName;
    }

    private static String generateUsername(String fullName) {
        return fullName.trim().replaceAll("\\s+", ".");
    }

    private static String generateTemporaryPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(TEMP_PASSWORD_LENGTH);
        for (int i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
            sb.append(PASSWORD_CHARS.charAt(random.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }
}
