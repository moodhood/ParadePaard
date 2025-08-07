package com.pm.contractservice.exception;

public class ContractAlreadyExistsException extends RuntimeException {
    public ContractAlreadyExistsException(String message) {
        super(message);
    }
}
