package com.pm.timesheetservice.mapper;

import com.pm.timesheetservice.dto.TimesheetRequestDTO;
import com.pm.timesheetservice.dto.TimesheetResponseDTO;
import com.pm.timesheetservice.model.Timesheet;

import java.time.LocalDate;
import java.util.UUID;

public class TimesheetMapper {
    public static TimesheetResponseDTO toDTO(Timesheet timesheet){
        TimesheetResponseDTO timesheetResponseDTO = new TimesheetResponseDTO();

        timesheetResponseDTO.setTimesheetId(timesheet.getTimesheetId().toString());
        timesheetResponseDTO.setUserId(timesheet.getUserId().toString());
        timesheetResponseDTO.setName(timesheet.getName());
        timesheetResponseDTO.setDateOfIssue(timesheet.getDateOfIssue().toString());
        timesheetResponseDTO.setWeekNumber(timesheet.getWeekNumber());
        timesheetResponseDTO.setWeekBasedYear(timesheet.getWeekBasedYear());
        timesheetResponseDTO.setFunction(timesheet.getFunction());
        timesheetResponseDTO.setHoursWorked(timesheet.getHoursWorked());
        timesheetResponseDTO.setTravelExpenses(timesheet.getTravelExpenses());

        return timesheetResponseDTO;
    }

    public static Timesheet toModel(TimesheetRequestDTO timesheetRequestDTO){
        Timesheet timesheet = new Timesheet();

        timesheet.setUserId(UUID.fromString(timesheetRequestDTO.getUserId()));
        timesheet.setName(timesheetRequestDTO.getName());
        timesheet.setDateOfIssue(LocalDate.parse(timesheetRequestDTO.getDateOfIssue()));
        timesheet.setFunction(timesheetRequestDTO.getFunction());
        timesheet.setHoursWorked(timesheetRequestDTO.getHoursWorked());
        timesheet.setTravelExpenses(timesheetRequestDTO.getTravelExpenses());

        return timesheet;
    }
}
