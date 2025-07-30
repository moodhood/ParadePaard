package com.pm.userservice.exception;

public class BankAccountNumberAlreadyExistsException extends RuntimeException {
    public BankAccountNumberAlreadyExistsException(String message) {
        super(message);
    }
}
