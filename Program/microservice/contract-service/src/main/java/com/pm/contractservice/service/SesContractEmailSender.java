package com.pm.contractservice.service;

import com.pm.contractservice.exception.ContractEmailDeliveryException;
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

@Service
public class SesContractEmailSender implements ContractEmailSender {
    private static final Logger log = LoggerFactory.getLogger(SesContractEmailSender.class);

    private final JavaMailSender mailSender;
    private final String fromEmail;

    public SesContractEmailSender(
            JavaMailSender mailSender,
            @Value("${email.from-address:noreply@lambdamanager.com}") String fromEmail
    ) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    @Override
    public void sendContractReadyEmail(String toEmail, String employeeName, String contractUrl) {
        String greetingName = employeeName == null || employeeName.isBlank() ? "there" : employeeName.trim();
        String text = """
                Hi %s,

                Your ParadePaard employment contract is ready to review and sign.

                Please open the contract, review the details carefully, and sign it at the bottom of the page.

                Review and sign contract:
                %s
                """.formatted(greetingName, contractUrl);

        String html = """
                <p>Hi %s,</p>
                <p>Your ParadePaard employment contract is ready to review and sign.</p>
                <p>Please open the contract, review the details carefully, and sign it at the bottom of the page.</p>
                <p><a href="%s">Review and sign contract</a></p>
                """.formatted(escapeHtml(greetingName), escapeHtml(contractUrl));

        sendEmail(toEmail, "Your ParadePaard contract is ready", text, html);
    }

    private void sendEmail(String toEmail, String subject, String text, String html) {
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
            log.error("SES contract email failed (from={}, to={})", fromEmail, toEmail, e);
            throw new ContractEmailDeliveryException("Failed to send contract email", e);
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
