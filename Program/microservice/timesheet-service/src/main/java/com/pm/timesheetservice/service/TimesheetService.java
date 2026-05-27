package com.pm.timesheetservice.service;

import com.pm.timesheetservice.dto.TimesheetRequestDTO;
import com.pm.timesheetservice.dto.TimesheetResponseDTO;
import com.pm.timesheetservice.dto.PagedResponseDTO;

import com.pm.timesheetservice.exception.TimesheetNotFoundException;
import com.pm.timesheetservice.model.Timesheet;
import com.pm.timesheetservice.repository.TimesheetRepository;
import com.pm.timesheetservice.mapper.TimesheetMapper;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.UUID;

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

    public PagedResponseDTO<TimesheetResponseDTO> getTimesheetsPage(int page, int size) {
        return PagedResponseDTO.from(
                timesheetRepository.findAllByOrderByDateOfIssueDesc(PageRequest.of(page, size)),
                TimesheetMapper::toDTO
        );
    }

    public List<TimesheetResponseDTO> getTimesheetsByUserId(UUID userId) {
        return timesheetRepository.findByUserIdOrderByDateOfIssueDesc(userId)
                .stream()
                .map(TimesheetMapper::toDTO)
                .toList();
    }

    public PagedResponseDTO<TimesheetResponseDTO> getTimesheetsByUserIdPage(UUID userId, int page, int size) {
        return PagedResponseDTO.from(
                timesheetRepository.findByUserIdOrderByDateOfIssueDesc(userId, PageRequest.of(page, size)),
                TimesheetMapper::toDTO
        );
    }

    public TimesheetResponseDTO getTimesheetById(UUID id) {
        Timesheet timesheet = timesheetRepository.findById(id)
                .orElseThrow(() -> new TimesheetNotFoundException("Timesheet with id: " + id + " not found"));
        return TimesheetMapper.toDTO(timesheet);
    }

    public TimesheetResponseDTO createTimesheet(TimesheetRequestDTO timesheetRequestDTO){
        LocalDate date = LocalDate.parse(timesheetRequestDTO.getDateOfIssue());

        //TODO barmedewerker, barrunner, barhoofd, feldrunner functies check,

        Timesheet timesheet = TimesheetMapper.toModel(timesheetRequestDTO);
        timesheet.setWeekNumber(date.get(WeekFields.ISO.weekOfWeekBasedYear()));
        timesheet.setWeekBasedYear(date.get(WeekFields.ISO.weekBasedYear()));

        timesheet = timesheetRepository.save(timesheet);
        return TimesheetMapper.toDTO(timesheet);
    }

    public TimesheetResponseDTO updateTimesheet(UUID id,TimesheetRequestDTO timesheetRequestDTO){
        Timesheet timesheet = timesheetRepository.findById(id)
                .orElseThrow(() -> new TimesheetNotFoundException("Timesheet with id: " + id + " not found"));

        timesheet.setUserId(UUID.fromString(timesheetRequestDTO.getUserId()));
        timesheet.setName(timesheetRequestDTO.getName());
        timesheet.setDateOfIssue(LocalDate.parse(timesheetRequestDTO.getDateOfIssue()));
        timesheet.setFunction(timesheetRequestDTO.getFunction());
        timesheet.setHoursWorked(timesheetRequestDTO.getHoursWorked());
        timesheet.setTravelExpenses(timesheetRequestDTO.getTravelExpenses());
        timesheet.setSourceScheduleEntryId(timesheetRequestDTO.getSourceScheduleEntryId() == null || timesheetRequestDTO.getSourceScheduleEntryId().isBlank()
                ? null : UUID.fromString(timesheetRequestDTO.getSourceScheduleEntryId()));
        timesheet.setSourceShiftId(timesheetRequestDTO.getSourceShiftId() == null || timesheetRequestDTO.getSourceShiftId().isBlank()
                ? null : UUID.fromString(timesheetRequestDTO.getSourceShiftId()));
        timesheet.setSourceProjectId(timesheetRequestDTO.getSourceProjectId() == null || timesheetRequestDTO.getSourceProjectId().isBlank()
                ? null : UUID.fromString(timesheetRequestDTO.getSourceProjectId()));
        timesheet.setProjectName(timesheetRequestDTO.getProjectName());
        timesheet.setShiftName(timesheetRequestDTO.getShiftName());
        timesheet.setShiftDate(timesheetRequestDTO.getShiftDate() == null || timesheetRequestDTO.getShiftDate().isBlank()
                ? null : LocalDate.parse(timesheetRequestDTO.getShiftDate()));
        timesheet.setShiftStartTime(timesheetRequestDTO.getShiftStartTime() == null || timesheetRequestDTO.getShiftStartTime().isBlank()
                ? null : java.time.LocalDateTime.parse(timesheetRequestDTO.getShiftStartTime()));
        timesheet.setShiftEndTime(timesheetRequestDTO.getShiftEndTime() == null || timesheetRequestDTO.getShiftEndTime().isBlank()
                ? null : java.time.LocalDateTime.parse(timesheetRequestDTO.getShiftEndTime()));
        timesheet.setBreakMinutes(timesheetRequestDTO.getBreakMinutes());
        timesheet.setTravelKilometers(timesheetRequestDTO.getTravelKilometers());
        timesheet.setTravelRate(timesheetRequestDTO.getTravelRate());

        timesheet = timesheetRepository.save(timesheet);
        return TimesheetMapper.toDTO(timesheet);
    }

    public void deleteTimesheet(UUID id){
        timesheetRepository.deleteById(id);
    }
}
