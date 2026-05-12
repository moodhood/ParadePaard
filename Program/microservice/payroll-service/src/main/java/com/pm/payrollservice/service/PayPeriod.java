package com.pm.payrollservice.service;

import java.time.LocalDate;

public record PayPeriod(String frequency, LocalDate start, LocalDate end, String key) {
}
