package com.pm.contractservice.exception;

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

    @ExceptionHandler(ContractAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleContractAlreadyExistsException(Exception ex){
        log.warn("Contract already exists {}!",  ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        errors.put("message", "Contract Already Exists");
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(ContractNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleContractNotFoundException(Exception ex) {
        log.warn("Contract not found {}!", ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        errors.put("message", "Contract Not Found");
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(FunctionNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleFunctionNotFoundException(Exception ex) {
        log.warn("Function not found {}!", ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        errors.put("message", "Function Not Found");
        return ResponseEntity.badRequest().body(errors);
    }
}
