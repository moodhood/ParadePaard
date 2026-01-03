package com.pm.authservice.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class SesSmtpEmailSender implements EmailSender {
    private static final Logger log = LoggerFactory.getLogger(SesSmtpEmailSender.class);

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
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Reset your LambdaManager password");

            String minutes = String.valueOf(Math.max(1, ttl.toMinutes()));
            String text = """
                    Someone requested a password reset for your LambdaManager account.

                    Use this link to reset your password (valid for %s minutes):
                    %s

                    If you didn't request this, you can ignore this email.
                    """.formatted(minutes, resetUrl);

            String html = """
                    <p>Someone requested a password reset for your LambdaManager account.</p>
                    <p><strong>This link is valid for %s minutes:</strong></p>
                    <p><a href="%s">Reset your password</a></p>
                    <p>If you didn't request this, you can ignore this email.</p>
                    """.formatted(minutes, resetUrl);

            helper.setText(text, html);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("SES SMTP send failed (from={}, to={})", fromEmail, toEmail, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    @Override
    public void sendEmployeeOnboardingEmail(String toEmail, String username, String temporaryPassword, String resetUrl, Duration ttl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Your LambdaManager account is ready");

            String minutes = String.valueOf(Math.max(1, ttl.toMinutes()));
            String text = """
                    An admin created your LambdaManager account.

                    Username:
                    %s

                    Temporary password:
                    %s

                    After logging in, you must set a new password. You can also set it immediately using this link (valid for %s minutes):
                    %s
                    """.formatted(username, temporaryPassword, minutes, resetUrl);

            String html = """
                    <p>An admin created your LambdaManager account.</p>
                    <p><strong>Username:</strong> %s</p>
                    <p><strong>Temporary password:</strong> %s</p>
                    <p>After logging in, you must set a new password. You can also set it immediately using this link (valid for %s minutes):</p>
                    <p><a href="%s">Set your new password</a></p>
                    """.formatted(escapeHtml(username), escapeHtml(temporaryPassword), minutes, resetUrl);

            helper.setText(text, html);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("SES SMTP send failed (from={}, to={})", fromEmail, toEmail, e);
            throw new RuntimeException("Failed to send onboarding email", e);
        }
    }

    private static String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
