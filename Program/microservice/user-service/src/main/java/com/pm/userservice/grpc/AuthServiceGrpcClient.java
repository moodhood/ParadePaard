package com.pm.userservice.grpc;

import auth.AuthServiceGrpc;
import auth.UpdatePasswordRequest;
import auth.UpdatePasswordResponse;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceGrpcClient {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceGrpcClient.class);
    private final AuthServiceGrpc.AuthServiceBlockingStub blockingStub;

    public AuthServiceGrpcClient(
            @Value("${auth.service.address:localhost}") String serverAddress,
            @Value("${auth.service.grpc.port:9005}") int serverPort) {

        log.info("Connecting to Auth Service GRPC at {}:{}", serverAddress, serverPort);

        ManagedChannel channel = ManagedChannelBuilder
                .forAddress(serverAddress, serverPort)
                .usePlaintext()
                .build();

        this.blockingStub = AuthServiceGrpc.newBlockingStub(channel);
    }

    public UpdatePasswordResponse updatePassword(String userId, String newPassword) {
        UpdatePasswordRequest request = UpdatePasswordRequest.newBuilder()
                .setUserId(userId)
                .setNewPassword(newPassword)
                .build();
        return blockingStub.updatePassword(request);
    }
}
