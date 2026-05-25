package com.pm.authservice;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class AuthSeedPermissionsTest {
    @Test
    void seedCreatesPayrollFinancePermissions() throws IOException {
        String sql = readSeedSql();

        assertThat(sql).contains("CAN_VIEW_PAYROLL_FINANCE");
        assertThat(sql).contains("CAN_MANAGE_PAYROLL_FINANCE");
    }

    @Test
    void adminSeedRoleIncludesPayrollFinancePermissions() throws IOException {
        String sql = readSeedSql();
        int adminAssignmentStart = sql.indexOf("-- assign permissions to ADMIN role");
        int userAssignmentStart = sql.indexOf("-- assign permissions to USER role");

        assertThat(adminAssignmentStart).isGreaterThanOrEqualTo(0);
        assertThat(userAssignmentStart).isGreaterThan(adminAssignmentStart);
        String adminAssignment = sql.substring(adminAssignmentStart, userAssignmentStart);

        assertThat(adminAssignment).contains("CAN_VIEW_PAYROLL_FINANCE");
        assertThat(adminAssignment).contains("CAN_MANAGE_PAYROLL_FINANCE");
    }

    private static String readSeedSql() throws IOException {
        try (InputStream input = AuthSeedPermissionsTest.class.getClassLoader().getResourceAsStream("data.sql")) {
            assertThat(input).isNotNull();
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
