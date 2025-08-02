package com.pm.payrollservice.grpc;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class UserServiceGrpcClient {

    private static final Logger log = LoggerFactory.getLogger(
            UserServiceGrpcClient.class);
    private final UserServiceGrpcClient.UserServiceBlockingStub blockingStub;

}
