package com.pm.payrollservice.mapper;

import com.pm.payrollservice.model.PayslipTimesheet;
import timesheet.TimesheetDataResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

final class PayslipTimesheetMerger {
    private PayslipTimesheetMerger() {}

    static List<PayslipTimesheet> merge(BigDecimal grossHourlyWage,
                                        TimesheetDataResponse timesheetData) {

        Map<String, PayslipTimesheet> byName = new LinkedHashMap<>();

        // fold in timesheets
        timesheetData.getTimesheetsList().forEach(ts -> {
            String key = normalize(ts.getFunctionName());
            PayslipTimesheet row = byName.computeIfAbsent(key, k -> freshWithName(ts.getFunctionName()));
            row.setTimesheetId(UUID.fromString(ts.getTimesheetId()));
            row.setDateOfIssue(LocalDate.parse(ts.getDateOfIssue()));
            row.setHoursWorked(row.getHoursWorked().add(new BigDecimal(ts.getHoursWorked())));
            row.setTravelExpenses(row.getTravelExpenses().add(new BigDecimal(ts.getTravelExpenses())));
            row.setHourlyWage(grossHourlyWage);
        });

        return new ArrayList<>(byName.values());
    }

    private static PayslipTimesheet freshWithName(String displayName) {
        PayslipTimesheet t = new PayslipTimesheet();
        t.setFunctionName(displayName);
        t.setHoursWorked(BigDecimal.ZERO);
        t.setTravelExpenses(BigDecimal.ZERO);
        return t;
    }

    private static String normalize(String s) {
        return s.trim().toLowerCase();
    }
}

