package com.pm.contractservice.service.events;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pm.contractservice.dto.UserProfileDTO;
import com.pm.contractservice.model.Contract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class ContractEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ContractEventPublisher.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final String topic;

    public ContractEventPublisher(
            KafkaTemplate<String, String> kafkaTemplate,
            ObjectMapper objectMapper,
            @Value("${contract.events.topic:contract-events}") String topic) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.topic = topic;
    }

    public void publishContractCreated(Contract contract) {
        ContractCreatedEvent event = new ContractCreatedEvent();
        event.setContractId(contract.getContractId().toString());
        event.setUserId(contract.getUserId().toString());
        event.setStartDate(contract.getStartDate().toString());
        event.setEndDate(contract.getEndDate().toString());
        event.setContractType(contract.getContractType().name());
        event.setGrossHourlyWage(contract.getGrossHourlyWage().toString());
        event.setTravelAllowance(Boolean.TRUE.equals(contract.getTravelAllowance()));

        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(topic, event.getUserId(), payload);
            log.info("Published contract created event contractId={} userId={}", event.getContractId(), event.getUserId());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize ContractCreatedEvent", e);
        }
    }

    public void publishEmployeeRegistered(Contract contract, UserProfileDTO profile) {
        EmployeeRegisteredEvent event = new EmployeeRegisteredEvent();
        event.setContractId(contract.getContractId().toString());
        event.setUserId(contract.getUserId().toString());
        event.setStartDate(contract.getStartDate().toString());
        event.setEndDate(contract.getEndDate().toString());
        event.setContractType(contract.getContractType().name());
        event.setGrossHourlyWage(contract.getGrossHourlyWage().toString());
        event.setTravelAllowance(Boolean.TRUE.equals(contract.getTravelAllowance()));
        event.setPreferredName(profile.getPreferredName());
        event.setFirstNames(profile.getFirstNames());
        event.setMiddleNamePrefix(profile.getMiddleNamePrefix());
        event.setLastName(profile.getLastName());
        event.setGender(profile.getGender());
        event.setDateOfBirth(profile.getDateOfBirth());
        event.setEmail(profile.getEmail());
        event.setMobileNumber(profile.getMobileNumber());
        event.setStreetName(profile.getStreetName());
        event.setHouseNumber(profile.getHouseNumber());
        event.setHouseNumberSuffix(profile.getHouseNumberSuffix());
        event.setPostalCode(profile.getPostalCode());
        event.setCity(profile.getCity());
        event.setCountry(profile.getCountry());
        event.setIban(profile.getIban());

        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(topic, event.getUserId(), payload);
            log.info("Published employee registered event contractId={} userId={}",
                    event.getContractId(), event.getUserId());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize EmployeeRegisteredEvent", e);
        }
    }
}
