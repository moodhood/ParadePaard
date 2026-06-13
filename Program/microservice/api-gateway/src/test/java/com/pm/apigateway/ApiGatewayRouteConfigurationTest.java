package com.pm.apigateway;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ApiGatewayRouteConfigurationTest {

    @Test
    void publicApplicationSubmissionRouteIsForwardedToUserServiceWithoutJwt() throws IOException {
        String route = routeBlock("user-service-public-applications");

        assertThat(route).contains("uri: http://user-service:4006");
        assertThat(route).contains("- Path=/api/applications");
        assertThat(route).contains("- StripPrefix=1");
        assertThat(route).doesNotContain("JwtValidation");
    }

    @Test
    void platformCompanyScopeRouteIsForwardedToAuthServiceWithJwtValidation() throws IOException {
        String route = routeBlock("auth-service-protected");

        assertThat(route).contains("uri: http://auth-service:4005");
        assertThat(route).contains("/auth/platform/company-scope");
        assertThat(route).contains("- StripPrefix=1");
        assertThat(route).contains("- JwtValidation");
    }

    private static String routeBlock(String routeId) throws IOException {
        List<String> lines = readApplicationYaml().lines().toList();
        int routeStart = -1;
        for (int i = 0; i < lines.size(); i++) {
            if (lines.get(i).trim().equals("- id: " + routeId)) {
                routeStart = i;
                break;
            }
        }

        assertThat(routeStart)
                .withFailMessage("Expected application.yml to contain route id %s", routeId)
                .isNotNegative();

        int routeEnd = lines.size();
        for (int i = routeStart + 1; i < lines.size(); i++) {
            if (lines.get(i).trim().startsWith("- id: ")) {
                routeEnd = i;
                break;
            }
        }
        return String.join("\n", lines.subList(routeStart, routeEnd));
    }

    private static String readApplicationYaml() throws IOException {
        try (InputStream stream = ApiGatewayRouteConfigurationTest.class
                .getClassLoader()
                .getResourceAsStream("application.yml")) {
            assertThat(stream).as("application.yml test resource").isNotNull();
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
