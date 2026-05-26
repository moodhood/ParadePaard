package com.pm.contractservice.model;

import java.util.Locale;

public enum ContractType {
    FIXED_HOURS,
    ON_CALL_RUNNER,
    ON_CALL_BAR;

    public static ContractType fromRequestValue(String rawValue, String rawFunctionName) {
        String value = normalize(rawValue);
        String functionName = normalize(rawFunctionName);

        return switch (value) {
            case "FULL_TIME", "PART_TIME", "FIXED", "FIXED_HOURS" -> FIXED_HOURS;
            case "ZERO_HOURS", "ON_CALL", "ON_CALL_RUNNER", "ON_CALL_BAR" -> {
                if ("ON_CALL_BAR".equals(value) || functionName.contains("BAR")) {
                    yield ON_CALL_BAR;
                }
                yield ON_CALL_RUNNER;
            }
            default -> ContractType.valueOf(value);
        };
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim()
                .toUpperCase(Locale.ROOT)
                .replace('-', '_')
                .replace(' ', '_');
    }
}
