package com.pm.userservice.service.events;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pm.userservice.model.UserStatus;
import com.pm.userservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * Consumes events published by contract-service on the "contract-events" topic.
 *
 * Today the topic carries two event shapes (both raw JSON keyed by userId):
 *   - ContractCreatedEvent   - fired when a draft contract is first persisted
 *   - EmployeeRegisteredEvent - fired when a contract is finalized (employer signed)
 *
 * Only the EmployeeRegisteredEvent should promote the user's profile status.
 * We disambiguate by checking for personal-data fields ("email"/"firstNames")
 * that exist on EmployeeRegisteredEvent but not on ContractCreatedEvent.
 *
 * The status flip is idempotent: a user whose status is already ACTIVE (or any
 * non-pending-contract value) is left alone.
 */
@Service
public class ContractEventListener {

    private static final Logger log = LoggerFactory.getLogger(ContractEventListener.class);

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public ContractEventListener(UserRepository userRepository, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    @KafkaListener(topics = "contract-events", groupId = "user-service")
    public void handleContractEvent(byte[] event) {
        if (event == null || event.length == 0) {
            return;
        }
        String payload = new String(event, StandardCharsets.UTF_8);

        JsonNode node;
        try {
            node = objectMapper.readTree(payload);
        } catch (Exception e) {
            log.warn("Failed to parse contract-events payload: {}", e.getMessage());
            return;
        }

        // Personal-data fields are only present on EmployeeRegisteredEvent (contract finalized).
        // ContractCreatedEvent only carries contract metadata, so we ignore it here.
        if (!node.hasNonNull("email") && !node.hasNonNull("firstNames")) {
            log.debug("Ignoring non-EmployeeRegistered event on contract-events");
            return;
        }

        String rawUserId = node.path("userId").asText(null);
        if (rawUserId == null || rawUserId.isBlank()) {
            log.warn("EmployeeRegisteredEvent missing userId; skipping");
            return;
        }

        UUID userId;
        try {
            userId = UUID.fromString(rawUserId);
        } catch (IllegalArgumentException e) {
            log.warn("EmployeeRegisteredEvent invalid userId={}", rawUserId);
            return;
        }

        userRepository.findByUserId(userId).ifPresentOrElse(
                user -> {
                    UserStatus current = user.getStatus();
                    if (current == UserStatus.PENDING_CONTRACT_SIGNATURE
                            || current == UserStatus.PENDING_CONTRACT_REVIEW) {
                        user.setStatus(UserStatus.ACTIVE);
                        userRepository.save(user);
                        log.info("Promoted user {} from {} to ACTIVE on contract finalize", userId, current);
                    } else {
                        log.info("User {} status {} unchanged on contract finalize (idempotent)", userId, current);
                    }
                },
                () -> log.warn("EmployeeRegisteredEvent userId={} not found in user-service", userId)
        );
    }
}
