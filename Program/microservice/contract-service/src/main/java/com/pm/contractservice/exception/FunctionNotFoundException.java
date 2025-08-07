package com.pm.contractservice.exception;

public class FunctionNotFoundException extends RuntimeException {
    public FunctionNotFoundException(String message) {
        super(message);
    }
}
