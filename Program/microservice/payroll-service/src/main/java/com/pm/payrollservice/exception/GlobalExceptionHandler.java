package com.pm.payrollservice.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
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

    @ExceptionHandler(ISOWeekPayslipAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleISOWeekPayslipAlreadyExistsException(Exception ex){
        log.warn("Weekly payslip for this user already exists {}!",  ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        errors.put("message", "Weekly payslip for this user already exists");
        return ResponseEntity.badRequest().body(errors);
    }
}
