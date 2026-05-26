package com.pm.userservice;

import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;

class UserServicePersistenceConfigTest {

    @Test
    void openEntityManagerInViewIsDisabledForLongLivedSseRequests() throws Exception {
        Properties properties = new Properties();
        try (InputStream input = getClass().getClassLoader().getResourceAsStream("application.properties")) {
            assertThat(input).isNotNull();
            properties.load(input);
        }

        assertThat(properties.getProperty("spring.jpa.open-in-view")).isEqualTo("false");
    }
}
