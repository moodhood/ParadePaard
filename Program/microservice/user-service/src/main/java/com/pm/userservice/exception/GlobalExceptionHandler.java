package com.pm.userservice.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException ex){
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach((error)-> errors.put(error.getField(), error.getDefaultMessage()));

        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleEmailAlreadyExistsException(Exception ex){
        log.warn("Email already exists {}!",  ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        errors.put("message", "Email Already Exists");
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFoundException(Exception ex){
        log.warn("Patient not found {}!",  ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        errors.put("message", "User Not Found");
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(BankAccountNumberAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleBankAccountNumberAlreadyExistsException(Exception ex){
        log.warn("Bank account number already exists {}!",  ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        errors.put("message", "Bank Account Number Already Exists");
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(PhoneNumberAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handlePhoneNumberAlreadyExistsException(Exception ex){
        log.warn("Phone number already exists {}!",  ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        errors.put("message", "Phone Number Already Exists");
        return ResponseEntity.badRequest().body(errors);
    }

}
