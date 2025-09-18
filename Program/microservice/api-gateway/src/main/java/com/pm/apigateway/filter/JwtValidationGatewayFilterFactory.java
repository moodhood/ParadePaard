package com.pm.apigateway.filter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class JwtValidationGatewayFilterFactory extends
        AbstractGatewayFilterFactory<Object> {

    private final WebClient webClient;

    public JwtValidationGatewayFilterFactory(WebClient.Builder webClientBuilder,
                                             @Value("${auth.service.url}") String authServiceUrl) {
        this.webClient = webClientBuilder.baseUrl(authServiceUrl).build();
    }

    @Override
    public GatewayFilter apply(Object config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            ServerHttpResponse response = exchange.getResponse();

            String accessToken = extractTokenFromCookies(request, "accessToken");
            String refreshToken = extractTokenFromCookies(request, "refreshToken");

            // If access token exists, validate it
            if (accessToken != null && !accessToken.isBlank()) {
                return validateAccessToken(accessToken)
                        .flatMap(isValid -> {
                            if (isValid) {
                                // Add the access token to the request header for downstream services
                                ServerHttpRequest mutated = request.mutate()
                                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                                        .build();
                                return chain.filter(exchange.mutate().request(mutated).build());
                            } else {
                                // Access token is invalid, try refresh if available
                                if (refreshToken != null && !refreshToken.isBlank()) {
                                    return refreshTokenAndContinue(refreshToken, exchange, chain, response);
                                } else {
                                    // No valid tokens available
                                    response.setStatusCode(HttpStatus.UNAUTHORIZED);
                                    return response.setComplete();
                                }
                            }
                        });
            }

            // No access token, try refresh token if available
            if (refreshToken != null && !refreshToken.isBlank()) {
                return refreshTokenAndContinue(refreshToken, exchange, chain, response);
            }

            // No tokens available
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return response.setComplete();
        };
    }

    private String extractTokenFromCookies(ServerHttpRequest request, String cookieName) {
        if (request.getCookies().containsKey(cookieName)) {
            return request.getCookies().getFirst(cookieName).getValue();
        }
        return null;
    }

    private Mono<Boolean> validateAccessToken(String accessToken) {
        return webClient.get()
                .uri("/validate")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .toBodilessEntity()
                .map(response -> true)
                .onErrorReturn(WebClientResponseException.class, false);
    }

    private Mono<Void> refreshTokenAndContinue(String refreshToken,
                                               org.springframework.web.server.ServerWebExchange exchange,
                                               org.springframework.cloud.gateway.filter.GatewayFilterChain chain,
                                               ServerHttpResponse response) {
        return webClient.post()
                .uri("/refresh")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + refreshToken)
                .retrieve()
                .toEntity(String.class)
                .flatMap(refreshResponse -> {
                    // Extract Set-Cookie headers from the refresh response
                    List<String> setCookieHeaders = refreshResponse.getHeaders().get(HttpHeaders.SET_COOKIE);

                    if (setCookieHeaders != null && !setCookieHeaders.isEmpty()) {
                        String newAccessToken = null;

                        // Forward the cookies to the client
                        for (String setCookieHeader : setCookieHeaders) {
                            response.getHeaders().add(HttpHeaders.SET_COOKIE, setCookieHeader);

                            // Extract the new access token from the cookie for the Authorization header
                            if (setCookieHeader.startsWith("accessToken=")) {
                                String tokenValue = setCookieHeader.substring(12); // Remove "accessToken="
                                int semicolonIndex = tokenValue.indexOf(';');
                                if (semicolonIndex > 0) {
                                    newAccessToken = tokenValue.substring(0, semicolonIndex);
                                } else {
                                    newAccessToken = tokenValue;
                                }
                            }
                        }

                        // Continue with the request, adding the new access token to the Authorization header
                        ServerHttpRequest mutated = exchange.getRequest().mutate()
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + (newAccessToken != null ? newAccessToken : ""))
                                .build();

                        return chain.filter(exchange.mutate().request(mutated).build());
                    } else {
                        // Refresh failed or didn't return cookies
                        response.setStatusCode(HttpStatus.UNAUTHORIZED);
                        return response.setComplete();
                    }
                })
                .onErrorResume(WebClientResponseException.class, ex -> {
                    // Refresh token is invalid or expired
                    response.setStatusCode(HttpStatus.UNAUTHORIZED);
                    return response.setComplete();
                });
    }
}