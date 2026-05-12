package com.pm.payrollservice.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class PayPeriodCalculatorTest {
    private final PayPeriodCalculator calculator = new PayPeriodCalculator();

    @Test
    void weeklyPeriodUsesIsoWeek() {
        PayPeriod period = calculator.periodFor("WEEKLY", LocalDate.of(2026, 5, 12));

        assertThat(period.start()).isEqualTo(LocalDate.of(2026, 5, 11));
        assertThat(period.end()).isEqualTo(LocalDate.of(2026, 5, 17));
        assertThat(period.key()).isEqualTo("WEEKLY:2026-W20");
    }

    @Test
    void monthlyPeriodUsesCalendarMonth() {
        PayPeriod period = calculator.periodFor("MONTHLY", LocalDate.of(2026, 5, 12));

        assertThat(period.start()).isEqualTo(LocalDate.of(2026, 5, 1));
        assertThat(period.end()).isEqualTo(LocalDate.of(2026, 5, 31));
        assertThat(period.key()).isEqualTo("MONTHLY:2026-05");
    }
}
