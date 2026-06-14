package com.pm.authservice.service;

import jakarta.mail.BodyPart;
import jakarta.mail.Multipart;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SesEmailSenderTest {

    @Test
    void sendsPasswordResetEmailAsTextAndHtml() throws Exception {
        TestMailContext context = mailContext();
        SesEmailSender sender = new SesEmailSender(context.mailSender(), "noreply@lambdamanager.com");

        sender.sendPasswordResetEmail(
                "employee@example.com",
                "https://app.example/reset-password?token=abc",
                Duration.ofMinutes(15)
        );

        verify(context.mailSender()).send(context.message());
        assertThat(context.message().getFrom()[0].toString()).isEqualTo("noreply@lambdamanager.com");
        assertThat(context.message().getAllRecipients()[0].toString()).isEqualTo("employee@example.com");
        assertThat(context.message().getSubject()).isEqualTo("Reset your LambdaManager password");
        assertThat(content(context.message(), "text/plain"))
                .contains("valid for 15 minutes")
                .contains("https://app.example/reset-password?token=abc");
        assertThat(content(context.message(), "text/html"))
                .contains("Reset your password")
                .contains("https://app.example/reset-password?token=abc");
    }

    @Test
    void sendsEmployeeOnboardingEmailWithEscapedHtml() throws Exception {
        TestMailContext context = mailContext();
        SesEmailSender sender = new SesEmailSender(context.mailSender(), "noreply@lambdamanager.com");

        sender.sendEmployeeOnboardingEmail(
                "employee@example.com",
                "alex<script>",
                "temporary<&>",
                "https://app.example/reset?token=a&b",
                Duration.ofMinutes(10)
        );

        assertThat(context.message().getSubject()).isEqualTo("Your LambdaManager account is ready");
        assertThat(content(context.message(), "text/plain"))
                .contains("alex<script>")
                .contains("temporary<&>");
        assertThat(content(context.message(), "text/html"))
                .contains("alex&lt;script&gt;")
                .contains("temporary&lt;&amp;&gt;")
                .contains("token=a&amp;b");
    }

    @Test
    void sendsEmployeeAccountSetupEmail() throws Exception {
        TestMailContext context = mailContext();
        SesEmailSender sender = new SesEmailSender(context.mailSender(), "noreply@lambdamanager.com");

        sender.sendEmployeeAccountSetupEmail(
                "employee@example.com",
                "https://app.example/setup?token=abc",
                Duration.ofMinutes(20)
        );

        verify(context.mailSender()).send(context.message());
        assertThat(context.message().getSubject()).isEqualTo("Your LambdaManager account is ready");
        assertThat(content(context.message(), "text/plain"))
                .contains("set your password and open your account")
                .contains("valid for 20 minutes");
        assertThat(content(context.message(), "text/html"))
                .contains("Set your password")
                .contains("https://app.example/setup?token=abc");
    }

    @Test
    void propagatesSesDeliveryFailure() {
        TestMailContext context = mailContext();
        doThrow(new MailSendException("SES unavailable")).when(context.mailSender()).send(context.message());
        SesEmailSender sender = new SesEmailSender(context.mailSender(), "noreply@lambdamanager.com");

        assertThatThrownBy(() -> sender.sendPasswordResetEmail(
                "employee@example.com",
                "https://app.example/reset?token=abc",
                Duration.ofMinutes(15)
        ))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to send password reset email")
                .hasCauseInstanceOf(MailSendException.class);
    }

    private static TestMailContext mailContext() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        MimeMessage message = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(message);
        return new TestMailContext(mailSender, message);
    }

    private static String content(MimeMessage message, String contentType) throws Exception {
        message.saveChanges();
        return content(message.getContent(), contentType);
    }

    private static String content(Object value, String contentType) throws Exception {
        if (!(value instanceof Multipart multipart)) {
            return "";
        }
        for (int index = 0; index < multipart.getCount(); index++) {
            BodyPart part = multipart.getBodyPart(index);
            if (part.isMimeType(contentType)) {
                return String.valueOf(part.getContent());
            }
            String nested = content(part.getContent(), contentType);
            if (!nested.isEmpty()) {
                return nested;
            }
        }
        return "";
    }

    private record TestMailContext(JavaMailSender mailSender, MimeMessage message) {
    }
}
