package com.pm.userservice.integration;

import com.pm.userservice.dto.ContractDraftRequestDTO;
import com.pm.userservice.dto.ContractDraftResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ContractServiceClient {

    private static final Logger log = LoggerFactory.getLogger(ContractServiceClient.class);

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public ContractServiceClient(
            @Value("${contract.service.base-url:http://localhost:4004}") String baseUrl) {
        this.restTemplate = new RestTemplate();
        this.baseUrl = baseUrl;
    }

    public ContractDraftResponseDTO createDraftContract(ContractDraftRequestDTO request, String accessToken) {
        String url = baseUrl + "/api/contract";
        return restTemplate.exchange(url, HttpMethod.POST, entity(accessToken, request), ContractDraftResponseDTO.class)
                .getBody();
    }

    public ContractDraftResponseDTO finalizeContract(String accessToken) {
        String url = baseUrl + "/api/contract/finalize";
        return restTemplate.exchange(url, HttpMethod.POST, entity(accessToken, null), ContractDraftResponseDTO.class)
                .getBody();
    }

    private HttpEntity<?> entity(String accessToken, Object body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (accessToken != null && !accessToken.isBlank()) {
            headers.setBearerAuth(accessToken);
        } else {
            log.warn("No access token provided for contract service call");
        }
        return new HttpEntity<>(body, headers);
    }
}
