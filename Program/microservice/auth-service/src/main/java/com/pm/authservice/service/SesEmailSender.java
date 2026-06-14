package com.pm.authservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class SesEmailSender implements EmailSender {
    private static final Logger log = LoggerFactory.getLogger(SesEmailSender.class);

    private final JavaMailSender mailSender;
    private final String fromEmail;

    public SesEmailSender(
            JavaMailSender mailSender,
            @Value("${email.from-address:noreply@lambdamanager.com}") String fromEmail
    ) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetUrl, Duration ttl) {
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
                """.formatted(minutes, escapeHtml(resetUrl));

        sendEmail(toEmail, "Reset your LambdaManager password", text, html, "password reset");
    }

    @Override
    public void sendEmployeeOnboardingEmail(
            String toEmail,
            String username,
            String temporaryPassword,
            String resetUrl,
            Duration ttl
    ) {
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
                """.formatted(
                escapeHtml(username),
                escapeHtml(temporaryPassword),
                minutes,
                escapeHtml(resetUrl)
        );

        sendEmail(toEmail, "Your LambdaManager account is ready", text, html, "onboarding");
    }

    @Override
    public void sendEmployeeAccountSetupEmail(String toEmail, String setupUrl, Duration ttl) {
        String minutes = String.valueOf(Math.max(1, ttl.toMinutes()));
        String text = """
                Your LambdaManager account is ready.

                Use this link to set your password and open your account (valid for %s minutes):
                %s
                """.formatted(minutes, setupUrl);

        String html = """
                <p>Your LambdaManager account is ready.</p>
                <p>Use this link to set your password and open your account (valid for %s minutes):</p>
                <p><a href="%s">Set your password</a></p>
                """.formatted(minutes, escapeHtml(setupUrl));

        sendEmail(toEmail, "Your LambdaManager account is ready", text, html, "account setup");
    }

    private void sendEmail(String toEmail, String subject, String text, String html, String purpose) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(text, html);
            mailSender.send(message);
        } catch (MessagingException | MailException e) {
            log.error("SES {} email failed (from={}, to={})", purpose, fromEmail, toEmail, e);
            throw new RuntimeException("Failed to send " + purpose + " email", e);
        }
    }

    private static String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
