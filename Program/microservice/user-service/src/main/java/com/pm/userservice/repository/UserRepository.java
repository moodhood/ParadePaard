package com.pm.userservice.repository;

import com.pm.userservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User>  findByUserId(UUID id);

    void deleteByUserId(UUID id);


    boolean existsByEmail(String email);
    boolean existsByEmailAndUserIdNot(String email, UUID id);
    boolean existsByBankAccountNumberAndUserIdNot(String bankAccountNumber, UUID id);
    boolean existsByPhoneNumberAndUserIdNot(String phoneNumber, UUID id);

}