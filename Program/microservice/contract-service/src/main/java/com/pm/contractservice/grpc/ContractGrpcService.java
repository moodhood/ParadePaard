package com.pm.contractservice.grpc;

import com.pm.contractservice.exception.ContractNotFoundException;
import com.pm.contractservice.model.Contract;
import com.pm.contractservice.repository.ContractRepository;
import contract.ContractDataRequest;
import contract.ContractDataResponse;
import contract.ContractServiceGrpc;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@GrpcService
public class ContractGrpcService extends ContractServiceGrpc.ContractServiceImplBase {

    private final ContractRepository contractRepository;

    public ContractGrpcService(ContractRepository contractRepository) {
        this.contractRepository = contractRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public void requestContractData(ContractDataRequest request, StreamObserver<ContractDataResponse> responseObserver) {
        try {
            UUID userId = UUID.fromString(request.getUserId());

            Contract contract = contractRepository.findByUserId(userId)
                    .orElseThrow(() -> new ContractNotFoundException("Contract for " + userId + " not found"));


            ContractDataResponse response = ContractDataResponse.newBuilder()
                    .setStartDate(contract.getStartDate().toString())
                    .setEndDate(contract.getEndDate().toString())
                    .setContractType(contract.getContractType().name())
                    .setGrossHourlyWage(contract.getGrossHourlyWage().toString())
                    .setTravelAllowance(Boolean.TRUE.equals(contract.getTravelAllowance()))
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (ContractNotFoundException e) {
            responseObserver.onError(Status.NOT_FOUND.withDescription(e.getMessage()).asRuntimeException());
        } catch (IllegalArgumentException e) {
            responseObserver.onError(Status.INVALID_ARGUMENT.withDescription("Bad userId").asRuntimeException());
        } catch (Exception e) {
            responseObserver.onError(Status.UNKNOWN.withDescription("Server error").withCause(e).asRuntimeException());
        }
    }
}
