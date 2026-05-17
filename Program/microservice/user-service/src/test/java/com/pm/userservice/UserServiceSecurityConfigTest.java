package com.pm.userservice;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;

class UserServiceSecurityConfigTest {

    @Test
    void applicationsEndpointIsPermittedForPublicSubmission() throws Exception {
        String securityConfig = Files.readString(Path.of("src/main/java/com/pm/userservice/config/SecurityConfig.java"));

        var matcher = Pattern.compile(
                        "\\.requestMatchers\\((?<matchers>.*?)\\)\\.permitAll\\(\\)",
                        Pattern.DOTALL
                )
                .matcher(securityConfig);

        assertThat(matcher.find()).isTrue();
        String permitMatchers = matcher.group("matchers");
        assertThat(permitMatchers)
                .contains("\"/applications\"")
                .contains("\"/applications/**\"");
    }
}
