package com.pm.contractservice.service;

import com.pm.contractservice.exception.ContractEmailDeliveryException;
import jakarta.mail.BodyPart;
import jakarta.mail.Multipart;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SesContractEmailSenderTest {

    @Test
    void sendsContractReadyEmailAsTextAndHtml() throws Exception {
        TestMailContext context = mailContext();
        SesContractEmailSender sender =
                new SesContractEmailSender(context.mailSender(), "noreply@lambdamanager.com");

        sender.sendContractReadyEmail(
                "imre@example.com",
                "Imre",
                "http://localhost:5173/contracts/contract-1/sign"
        );

        verify(context.mailSender()).send(context.message());
        assertThat(context.message().getFrom()[0].toString()).isEqualTo("noreply@lambdamanager.com");
        assertThat(context.message().getAllRecipients()[0].toString()).isEqualTo("imre@example.com");
        assertThat(context.message().getSubject()).isEqualTo("Your ParadePaard contract is ready");
        assertThat(content(context.message(), "text/plain"))
                .contains("Hi Imre")
                .contains("Your ParadePaard employment contract is ready to review and sign.")
                .contains("http://localhost:5173/contracts/contract-1/sign");
        assertThat(content(context.message(), "text/html"))
                .contains("Review and sign contract")
                .contains("http://localhost:5173/contracts/contract-1/sign")
                .doesNotContain("Open your employment details");
    }

    @Test
    void fallsBackToGenericGreetingAndEscapesHtml() throws Exception {
        TestMailContext context = mailContext();
        SesContractEmailSender sender =
                new SesContractEmailSender(context.mailSender(), "noreply@lambdamanager.com");

        sender.sendContractReadyEmail(
                "imre@example.com",
                " ",
                "https://app.example/contracts/1/sign?a=1&b=2"
        );

        assertThat(content(context.message(), "text/plain")).contains("Hi there");
        assertThat(content(context.message(), "text/html"))
                .contains("Hi there")
                .contains("a=1&amp;b=2");
    }

    @Test
    void translatesSesDeliveryFailure() {
        TestMailContext context = mailContext();
        doThrow(new MailSendException("SES unavailable")).when(context.mailSender()).send(context.message());
        SesContractEmailSender sender =
                new SesContractEmailSender(context.mailSender(), "noreply@lambdamanager.com");

        assertThatThrownBy(() -> sender.sendContractReadyEmail(
                "imre@example.com",
                "Imre",
                "http://localhost:5173/contracts/contract-1/sign"
        ))
                .isInstanceOf(ContractEmailDeliveryException.class)
                .hasMessage("Failed to send contract email")
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
