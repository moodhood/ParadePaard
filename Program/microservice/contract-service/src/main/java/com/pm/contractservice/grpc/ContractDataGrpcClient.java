package com.pm.contractservice.grpc;

import contract.ContractDataRequest;
import contract.ContractDataResponse;
import contract.ContractServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ContractDataGrpcClient {

    private static final Logger log = LoggerFactory.getLogger(ContractDataGrpcClient.class);
    private final ContractServiceGrpc.ContractServiceBlockingStub blockingStub;

    public ContractDataGrpcClient(
            @Value("${contract.service.address:localhost}") String serverAddress,
            @Value("${contract.service.grpc.port:9002}") int serverPort) {

        log.info("Connecting to Contract Service GRPC at {}:{}", serverAddress, serverPort);

        ManagedChannel channel = ManagedChannelBuilder
                .forAddress(serverAddress, serverPort)
                .usePlaintext()
                .build();

        this.blockingStub = ContractServiceGrpc.newBlockingStub(channel);
    }

    public ContractDataResponse requestContractData(String userId) {
        ContractDataRequest request = ContractDataRequest.newBuilder()
                .setUserId(userId)
                .build();
        return blockingStub.requestContractData(request);
    }
}
