package com.pm.authservice;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class EmailConfigurationTest {

    @Test
    void configuresAmazonSesSmtpWithRequiredTls() throws Exception {
        String properties = Files.readString(Path.of("src/main/resources/application.properties"));

        assertThat(properties)
                .contains("spring.mail.host=${SES_SMTP_HOST:email-smtp.eu-north-1.amazonaws.com}")
                .contains("spring.mail.port=${SES_SMTP_PORT:587}")
                .contains("spring.mail.username=${SES_SMTP_USERNAME:}")
                .contains("spring.mail.password=${SES_SMTP_PASSWORD:}")
                .contains("spring.mail.properties.mail.smtp.auth=true")
                .contains("spring.mail.properties.mail.smtp.starttls.enable=true")
                .contains("spring.mail.properties.mail.smtp.starttls.required=true")
                .contains("spring.mail.properties.mail.smtp.ssl.checkserveridentity=true")
                .contains("spring.mail.properties.mail.smtp.connectiontimeout=10000")
                .contains("spring.mail.properties.mail.smtp.timeout=20000")
                .contains("spring.mail.properties.mail.smtp.writetimeout=20000")
                .contains("email.from-address=${SES_FROM_EMAIL:noreply@lambdamanager.com}")
                .doesNotContainIgnoringCase("mailersend");
    }

    @Test
    void dockerComposeRequiresSesSmtpCredentials() throws Exception {
        String compose = Files.readString(Path.of("../docker-compose.yml"));

        assertThat(compose)
                .contains("SES_SMTP_USERNAME: \"${SES_SMTP_USERNAME:?SES_SMTP_USERNAME must be set}\"")
                .contains("SES_SMTP_PASSWORD: \"${SES_SMTP_PASSWORD:?SES_SMTP_PASSWORD must be set}\"")
                .doesNotContain("SES_SMTP_USERNAME: \"${SES_SMTP_USERNAME:-}\"")
                .doesNotContain("SES_SMTP_PASSWORD: \"${SES_SMTP_PASSWORD:-}\"");
    }
}
