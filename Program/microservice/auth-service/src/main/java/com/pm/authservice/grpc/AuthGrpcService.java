package com.pm.authservice.grpc;

import auth.AuthServiceGrpc;
import auth.UpdatePasswordRequest;
import auth.UpdatePasswordResponse;
import com.pm.authservice.exception.UserNotFoundException;
import com.pm.authservice.model.User;
import com.pm.authservice.repository.UserRepository;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

@GrpcService
public class AuthGrpcService extends AuthServiceGrpc.AuthServiceImplBase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthGrpcService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void updatePassword(UpdatePasswordRequest request, StreamObserver<UpdatePasswordResponse> responseObserver) {
        try {
            UUID userId = UUID.fromString(request.getUserId());
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException("User not found " + userId));

            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);

            UpdatePasswordResponse response = UpdatePasswordResponse.newBuilder()
                    .setUpdated(true)
                    .setMessage("Password updated")
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (UserNotFoundException e) {
            responseObserver.onError(Status.NOT_FOUND.withDescription(e.getMessage()).asRuntimeException());
        } catch (IllegalArgumentException e) {
            responseObserver.onError(Status.INVALID_ARGUMENT.withDescription("Bad userId").asRuntimeException());
        } catch (Exception e) {
            responseObserver.onError(Status.UNKNOWN.withDescription("Server error").withCause(e).asRuntimeException());
        }
    }
}
