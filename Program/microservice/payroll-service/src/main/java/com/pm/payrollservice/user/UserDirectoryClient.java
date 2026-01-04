package com.pm.payrollservice.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
public class UserDirectoryClient {
    public record UserRow(String userId, Integer payslipFrequencyMinutes, String status) {}

    private final RestClient restClient;
    private final String baseUrl;
    private final ServiceJwtProvider jwtProvider;

    public UserDirectoryClient(
            ServiceJwtProvider jwtProvider,
            @Value("${user.service.base-url:http://localhost:4006}") String baseUrl
    ) {
        this.jwtProvider = jwtProvider;
        this.baseUrl = baseUrl;
        this.restClient = RestClient.builder().build();
    }

    public List<UserRow> getAllUsers() {
        UserRow[] rows = restClient.get()
                .uri(baseUrl + "/users")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtProvider.adminToken())
                .retrieve()
                .body(UserRow[].class);

        if (rows == null) return Collections.emptyList();
        return Arrays.asList(rows);
    }
}

