package com.pm.contractservice.service;

import com.pm.contractservice.exception.ContractEmailDeliveryException;
import com.pm.contractservice.grpc.UserServiceGrpcClient;
import com.pm.contractservice.model.Contract;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import user.UserDataResponse;

@Service
public class ContractNotificationService {
    private final UserServiceGrpcClient userServiceGrpcClient;
    private final ContractEmailSender contractEmailSender;
    private final String contractBaseUrl;

    public ContractNotificationService(
            UserServiceGrpcClient userServiceGrpcClient,
            ContractEmailSender contractEmailSender,
            @Value("${contract.email.contract-url:http://localhost:5173}") String contractBaseUrl
    ) {
        this.userServiceGrpcClient = userServiceGrpcClient;
        this.contractEmailSender = contractEmailSender;
        this.contractBaseUrl = contractBaseUrl;
    }

    public void sendContractReady(Contract contract) {
        UserDataResponse userData = userServiceGrpcClient.requestUserData(contract.getUserId().toString());
        String email = userData.getEmail() == null ? "" : userData.getEmail().trim();
        if (email.isBlank()) {
            throw new ContractEmailDeliveryException("Employee email address is missing");
        }

        contractEmailSender.sendContractReadyEmail(email, displayName(userData), contractSignUrl(contract));
    }

    private String contractSignUrl(Contract contract) {
        String base = contractBaseUrl == null || contractBaseUrl.isBlank()
                ? "http://localhost:5173"
                : contractBaseUrl.trim();
        String contractId = contract.getContractId() == null ? "" : contract.getContractId().toString();
        if (base.contains("{contractId}")) {
            return base.replace("{contractId}", contractId);
        }
        while (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/contracts/" + contractId + "/sign";
    }

    private static String displayName(UserDataResponse userData) {
        String preferredName = userData.getPreferredName();
        if (preferredName != null && !preferredName.isBlank()) {
            return preferredName.trim();
        }

        StringBuilder fullName = new StringBuilder();
        appendNamePart(fullName, userData.getFirstNames());
        appendNamePart(fullName, userData.getMiddleNamePrefix());
        appendNamePart(fullName, userData.getLastName());
        return fullName.toString();
    }

    private static void appendNamePart(StringBuilder fullName, String part) {
        if (part == null || part.isBlank()) {
            return;
        }
        if (!fullName.isEmpty()) {
            fullName.append(' ');
        }
        fullName.append(part.trim());
    }
}
