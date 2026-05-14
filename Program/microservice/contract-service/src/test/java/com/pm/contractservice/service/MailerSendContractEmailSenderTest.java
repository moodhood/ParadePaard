package com.pm.contractservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class MailerSendContractEmailSenderTest {

    @Test
    void contractReadyEmailUsesReviewAndSignCopy() throws IOException {
        AtomicReference<String> body = new AtomicReference<>("");
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/email", exchange -> {
            body.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            exchange.sendResponseHeaders(202, -1);
            exchange.close();
        });
        server.start();
        try {
            String apiUrl = "http://localhost:" + server.getAddress().getPort() + "/email";
            MailerSendContractEmailSender sender = new MailerSendContractEmailSender(
                    new ObjectMapper(),
                    "token",
                    apiUrl,
                    "noreply@example.com"
            );

            sender.sendContractReadyEmail("imre@example.com", "Imre", "http://localhost:5173/contracts/contract-1/sign");

            assertThat(body.get()).contains("Your ParadePaard employment contract is ready to review and sign.");
            assertThat(body.get()).contains("Please open the contract, review the details carefully, and sign it at the bottom of the page.");
            assertThat(body.get()).contains("Review and sign contract");
            assertThat(body.get()).doesNotContain("Open your employment details");
        } finally {
            server.stop(0);
        }
    }
}
