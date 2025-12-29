package com.pm.authservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.Duration;

@Service
public class SesSmtpEmailSender implements EmailSender {
    private final JavaMailSender mailSender;
    private final String fromEmail;

    public SesSmtpEmailSender(
            JavaMailSender mailSender,
            @Value("${password-reset.from-email:noreply@lambdamanager.com}") String fromEmail
    ) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetUrl, Duration ttl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Reset your LambdaManager password");

            String minutes = String.valueOf(Math.max(1, ttl.toMinutes()));
            String text = """
                    Someone requested a password reset for your LambdaManager account.

                    Use this link to reset your password (valid for %s minutes):
                    %s

                    If you didn’t request this, you can ignore this email.
                    """.formatted(minutes, resetUrl);

            String html = """
                    <p>Someone requested a password reset for your LambdaManager account.</p>
                    <p><strong>This link is valid for %s minutes:</strong></p>
                    <p><a href="%s">Reset your password</a></p>
                    <p>If you didn’t request this, you can ignore this email.</p>
                    """.formatted(minutes, resetUrl);

            helper.setText(text, html);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
}

