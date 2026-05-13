package com.pm.contractservice;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class DockerComposeConfigurationTest {

    @Test
    void contractServiceUsesUserServiceGrpcAddressInDocker() throws Exception {
        String compose = Files.readString(Path.of("..", "docker-compose.yml"));
        String contractService = compose.substring(
                compose.indexOf("  contract-service:"),
                compose.indexOf("  planning-service:")
        );

        assertThat(contractService).contains("USER_SERVICE_ADDRESS: \"user-service\"");
        assertThat(contractService).contains("USER_SERVICE_GRPC_PORT: \"9006\"");
        assertThat(contractService).contains("depends_on: [contract-service-db, user-service, kafka]");
    }
}
