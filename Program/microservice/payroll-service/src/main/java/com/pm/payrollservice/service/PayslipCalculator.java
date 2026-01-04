package com.pm.payrollservice.service;

import com.pm.payrollservice.model.Payslip;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class PayslipCalculator {
    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private PayslipCalculator() {}

    public static void apply(Payslip payslip) {
        BigDecimal hours = nz(payslip.getTotalHoursWorked());
        BigDecimal rate = nz(payslip.getHourlyWage());

        BigDecimal gross = hours.multiply(rate);
        BigDecimal travel = nz(payslip.getTravelExpenses());

        gross  = money(gross);
        travel = money(travel);
        BigDecimal tax = money(nz(payslip.getWageTaxWithheldTest()));

        // store totals
        payslip.setTotalGrossAmount(gross);
        payslip.setTravelExpenses(travel);
        payslip.setTotalNetAmount(money(gross.subtract(tax).add(travel)));
    }

    private static BigDecimal nz(BigDecimal x) {
        return x == null ? ZERO : x;
    }

    private static BigDecimal money(BigDecimal x) {
        return x.setScale(2, RoundingMode.HALF_UP);
    }
}
