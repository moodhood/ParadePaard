package com.pm.timesheetservice.service;

import com.pm.timesheetservice.dto.TimesheetRequestDTO;
import com.pm.timesheetservice.dto.TimesheetResponseDTO;

import com.pm.timesheetservice.model.Timesheet;
import com.pm.timesheetservice.repository.TimesheetRepository;
import com.pm.timesheetservice.mapper.TimesheetMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;

@Service
public class TimesheetService {

    private final TimesheetRepository timesheetRepository;
    public TimesheetService(TimesheetRepository timesheetRepository){
        this.timesheetRepository = timesheetRepository;
    }

    public List<TimesheetResponseDTO> getTimesheets(){
        List<Timesheet> timesheets = timesheetRepository.findAll();
        return timesheets.stream().map(TimesheetMapper::toDTO).toList();
    }

    public TimesheetResponseDTO createTimesheet(TimesheetRequestDTO timesheetRequestDTO){
        LocalDate date = LocalDate.parse(timesheetRequestDTO.getDateOfIssue());

        Timesheet timesheet = TimesheetMapper.toModel(timesheetRequestDTO);
        timesheet.setWeekNumber(date.get(WeekFields.ISO.weekOfWeekBasedYear()));
        timesheet.setWeekBasedYear(date.get(WeekFields.ISO.weekBasedYear()));

        timesheet = timesheetRepository.save(timesheet);
        return TimesheetMapper.toDTO(timesheet);
    }
}
