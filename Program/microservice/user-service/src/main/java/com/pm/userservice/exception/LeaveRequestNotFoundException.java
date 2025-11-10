// src/main/java/com/pm/userservice/exception/LeaveRequestNotFoundException.java
package com.pm.userservice.exception;

public class LeaveRequestNotFoundException extends RuntimeException {
    public LeaveRequestNotFoundException(String message) {
        super(message);
    }
}
