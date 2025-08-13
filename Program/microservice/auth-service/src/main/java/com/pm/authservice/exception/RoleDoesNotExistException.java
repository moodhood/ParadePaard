package com.pm.authservice.exception;

public class RoleDoesNotExistException extends RuntimeException {
    public RoleDoesNotExistException(String message) {
        super(message);
    }
}
