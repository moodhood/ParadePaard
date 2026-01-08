package com.pm.userservice.kafka;

import com.pm.userservice.mapper.UserMapper;
import com.pm.userservice.model.Company;
import com.pm.userservice.model.User;
import com.pm.userservice.repository.CompanyRepository;
import com.pm.userservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import user.events.UserRegisteredEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.kafka.annotation.KafkaListener;
import com.google.protobuf.InvalidProtocolBufferException;

@Service
public class KafkaConsumer {
    
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private static final Logger log = LoggerFactory.getLogger(KafkaConsumer.class);
    
    public KafkaConsumer(UserRepository userRepository, CompanyRepository companyRepository){
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
    }

    @Transactional
    @KafkaListener(topics = "user", groupId = "user-service")
    public void consumeEvent(byte[] event){
        try{
            UserRegisteredEvent userRegisteredEvent = UserRegisteredEvent.parseFrom(event);

            // Use the mapper to convert the event to a User entity
            User user = UserMapper.toModelUserRegisteredEvent(userRegisteredEvent);

            if (user != null) {
                if (userRepository.existsById(user.getUserId())) {
                    log.info("User already exists with ID: {}", user.getUserId());
                    return;
                }
                if (user.getCompanyId() != null && companyRepository.findById(user.getCompanyId()).isEmpty()) {
                    Company company = new Company();
                    company.setId(user.getCompanyId());
                    company.setName("Company");
                    companyRepository.save(company);
                }
                User newUser = userRepository.save(user);
                log.info("Saved new user with ID: {}", newUser.getUserId());
            }

        } catch (InvalidProtocolBufferException e){
            log.error("Error deserializing event: {}", e.getMessage());
        }
    }
}
