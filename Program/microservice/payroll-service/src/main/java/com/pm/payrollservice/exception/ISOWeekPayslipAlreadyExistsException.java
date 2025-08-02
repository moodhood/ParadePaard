package com.pm.payrollservice.exception;

public class ISOWeekPayslipAlreadyExistsException extends RuntimeException {
    public ISOWeekPayslipAlreadyExistsException(String message) {
        super(message);
    }
}
