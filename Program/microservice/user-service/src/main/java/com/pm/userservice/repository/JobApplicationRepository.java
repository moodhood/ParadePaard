package com.pm.userservice.repository;

import com.pm.userservice.model.ApplicationStatus;
import com.pm.userservice.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    List<JobApplication> findAllByStatusOrderBySubmittedAtDesc(ApplicationStatus status);
    boolean existsByEmailAndStatus(String email, ApplicationStatus status);
}
