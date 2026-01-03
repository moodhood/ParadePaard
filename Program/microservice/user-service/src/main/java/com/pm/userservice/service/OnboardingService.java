package com.pm.userservice.service;

import com.pm.userservice.dto.AdminOnboardingRequestDTO;
import com.pm.userservice.dto.AdminOnboardingResponseDTO;
import com.pm.userservice.dto.AuthAdminOnboardUserRequestDTO;
import com.pm.userservice.dto.AuthAdminOnboardUserResponseDTO;
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
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
public class OnboardingService {

    private final UserRepository userRepository;
    private final AuthServiceClient authServiceClient;
    private final ContractServiceClient contractServiceClient;
    private final AuthServiceGrpcClient authServiceGrpcClient;

    public OnboardingService(UserRepository userRepository,
                             AuthServiceClient authServiceClient,
                             ContractServiceClient contractServiceClient,
                             AuthServiceGrpcClient authServiceGrpcClient) {
        this.userRepository = userRepository;
        this.authServiceClient = authServiceClient;
        this.contractServiceClient = contractServiceClient;
        this.authServiceGrpcClient = authServiceGrpcClient;
    }

    @Transactional
    public AdminOnboardingResponseDTO adminOnboard(AdminOnboardingRequestDTO request, String accessToken) {
        AuthAdminOnboardUserRequestDTO authRequest = new AuthAdminOnboardUserRequestDTO();
        authRequest.setEmail(request.getEmail());
        authRequest.setFirstName(request.getFirstNames());
        authRequest.setLastName(buildAuthLastName(request));

        AuthAdminOnboardUserResponseDTO authResponse = authServiceClient.adminOnboardUser(authRequest, accessToken);
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
        user.setPosition(request.getPosition());
        user.setWorkedForUsBefore(Boolean.TRUE.equals(request.getWorkedForUsBefore()));
        user.setStatus(UserStatus.PENDING_SETUP);
        userRepository.save(user);

        ContractDraftRequestDTO contractRequest = new ContractDraftRequestDTO();
        contractRequest.setUserId(userId.toString());
        contractRequest.setStartDate(request.getStartDate());
        contractRequest.setEndDate(request.getEndDate());
        contractRequest.setContractType(mapContractType(request.getContractType(), request.getPosition()));
        contractRequest.setGrossHourlyWage(request.getGrossHourlyWage());
        contractRequest.setTravelAllowance(request.getTravelAllowance());

        ContractDraftResponseDTO contractResponse = contractServiceClient.createDraftContract(contractRequest, accessToken);

        AdminOnboardingResponseDTO response = new AdminOnboardingResponseDTO();
        response.setUserId(userId.toString());
        response.setContractId(contractResponse != null ? contractResponse.getContractId() : null);
        response.setUsername(authResponse.getUsername());
        response.setTemporaryPassword(authResponse.getTemporaryPassword());
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

    private static String buildAuthLastName(AdminOnboardingRequestDTO request) {
        String prefix = request.getMiddleNamePrefix();
        String lastName = request.getLastName();
        if (StringUtils.isBlank(prefix)) {
            return lastName == null ? "" : lastName.trim();
        }
        if (StringUtils.isBlank(lastName)) {
            return prefix.trim();
        }
        return prefix.trim() + " " + lastName.trim();
    }

    private static String mapContractType(String rawContractType, String rawPosition) {
        String contractType = rawContractType == null ? "" : rawContractType.trim().toUpperCase(Locale.ROOT);
        String position = rawPosition == null ? "" : rawPosition.trim().toUpperCase(Locale.ROOT);

        if (contractType.equals("FIXED") || contractType.equals("FIXED_HOURS")) {
            return "FIXED_HOURS";
        }

        if (contractType.equals("ON_CALL") || contractType.startsWith("ON_CALL")) {
            if (position.contains("BAR")) return "ON_CALL_BAR";
            if (position.contains("RUNNER")) return "ON_CALL_RUNNER";
            return "ON_CALL_RUNNER";
        }

        return contractType;
    }
}
