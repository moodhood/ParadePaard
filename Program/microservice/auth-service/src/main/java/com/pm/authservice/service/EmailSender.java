package com.pm.authservice.service;

import java.time.Duration;

public interface EmailSender {
    void sendPasswordResetEmail(String toEmail, String resetUrl, Duration ttl);
}

